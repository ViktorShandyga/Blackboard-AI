import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { describeFailure } from '@/lib/openrouter';
import { requestVoiceTutorReply } from '@/lib/voiceTutor';

export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';
export type VoiceLanguage = 'uk' | 'en';

export interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  lang: VoiceLanguage;
  at: number;
}

export interface VoiceSettings {
  language: VoiceLanguage;
  /** Гучність озвучення, 0..1. */
  volume: number;
  /** Швидкість мовлення, 0.5..1.5. */
  rate: number;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = { language: 'uk', volume: 1, rate: 1 };

const SETTINGS_KEY = 'blackboard-ai:voice-settings';
const CHAT_KEY = 'blackboard-ai:voice-chat';
const CHAT_LIMIT = 60;
const FINALIZE_DELAY_MS = 1100;

const LANG_CODES: Record<VoiceLanguage, string> = { uk: 'uk-UA', en: 'en-US' };

/* ── Мінімальні типи Web Speech API (DOM lib їх не постачає) ── */

interface RecognitionAlternativeLike {
  transcript: string;
}

interface RecognitionResultLike {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: RecognitionAlternativeLike;
}

interface RecognitionEventLike {
  readonly resultIndex: number;
  readonly results: { readonly length: number; [index: number]: RecognitionResultLike };
}

interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => RecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

/* ── Збереження налаштувань та історії розмови ── */

function loadSettings(): VoiceSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_VOICE_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<VoiceSettings>;
    return {
      language: parsed.language === 'en' ? 'en' : 'uk',
      volume: typeof parsed.volume === 'number' ? Math.min(1, Math.max(0, parsed.volume)) : DEFAULT_VOICE_SETTINGS.volume,
      rate: typeof parsed.rate === 'number' ? Math.min(1.5, Math.max(0.5, parsed.rate)) : DEFAULT_VOICE_SETTINGS.rate,
    };
  } catch {
    return DEFAULT_VOICE_SETTINGS;
  }
}

function saveSettings(settings: VoiceSettings): void {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadChatFrom(storageKey: string): VoiceMessage[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is VoiceMessage =>
        typeof item?.id === 'string' &&
        (item?.role === 'user' || item?.role === 'assistant') &&
        typeof item?.text === 'string' &&
        (item?.lang === 'uk' || item?.lang === 'en') &&
        typeof item?.at === 'number',
    );
  } catch {
    return [];
  }
}

function saveChatTo(storageKey: string, messages: VoiceMessage[]): void {
  window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-CHAT_LIMIT)));
}

let messageSeq = 0;
function nextMessageId(role: string): string {
  messageSeq += 1;
  return `${role}-${Date.now()}-${messageSeq}`;
}

export interface VoiceTutorOptions {
  /** Ключ localStorage для історії; null — сесійний діалог без збереження. За замовчуванням — спільна історія сторінки Voice AI. */
  storageKey?: string | null;
  /** Динамічний контекст (тема уроку тощо), що додається до системного промпта перед кожним запитом. */
  contextPrompt?: () => string;
}

export interface VoiceTutor {
  status: VoiceStatus;
  micEnabled: boolean;
  interim: string;
  messages: VoiceMessage[];
  error: string | null;
  settings: VoiceSettings;
  /** Рівень звуку мікрофона 0..1, оновлюється поза React (для сфери). */
  voiceLevelRef: MutableRefObject<number>;
  startMic: () => void;
  stopMic: () => void;
  stopSpeaking: () => void;
  clearHistory: () => void;
  sendMessage: (text: string) => void;
  updateSettings: (patch: Partial<VoiceSettings>) => void;
  dismissError: () => void;
}

export function isSpeechSupported(): boolean {
  return getRecognitionCtor() !== null && 'speechSynthesis' in window;
}

export function useVoiceTutor(apiKey: string, model: string, options?: VoiceTutorOptions): VoiceTutor {
  const storageKey = options?.storageKey === undefined ? CHAT_KEY : options.storageKey;

  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [micEnabled, setMicEnabled] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<VoiceMessage[]>(() => (storageKey ? loadChatFrom(storageKey) : []));
  const [settings, setSettings] = useState<VoiceSettings>(loadSettings);

  const statusRef = useRef(status);
  statusRef.current = status;
  const micRef = useRef(micEnabled);
  micRef.current = micEnabled;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const apiKeyRef = useRef(apiKey);
  apiKeyRef.current = apiKey;
  const modelRef = useRef(model);
  modelRef.current = model;
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const contextRef = useRef<VoiceTutorOptions['contextPrompt']>(options?.contextPrompt);
  contextRef.current = options?.contextPrompt;

  const voiceLevelRef = useRef(0);

  const recognitionRef = useRef<RecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const meterRafRef = useRef(0);
  const finalizeTimerRef = useRef(0);
  const restartTimerRef = useRef(0);
  const finalBufferRef = useRef('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (storageKey) saveChatTo(storageKey, messagesRef.current);
  }, [messages, storageKey]);
  useEffect(() => saveSettings(settings), [settings]);

  /* Прогрів списку голосів TTS (Chrome постачає їх асинхронно). */
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const warm = () => window.speechSynthesis.getVoices();
    warm();
    window.speechSynthesis.addEventListener('voiceschanged', warm);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', warm);
  }, []);

  const pickVoice = useCallback((lang: VoiceLanguage): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    const code = LANG_CODES[lang];
    return (
      voices.find((voice) => voice.lang.replace('_', '-').toLowerCase() === code.toLowerCase()) ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith(lang)) ??
      null
    );
  }, []);

  const silenceRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* інстанс уже зупинено */
    }
  }, []);

  /* Повертає мікрофон у режим «Слухаю» після відповіді або переривання. */
  const resumeListening = useCallback(() => {
    finalBufferRef.current = '';
    setInterim('');
    setStatus('listening');
    window.clearTimeout(restartTimerRef.current);
    restartTimerRef.current = window.setTimeout(() => {
      if (!micRef.current || statusRef.current !== 'listening') return;
      try {
        recognitionRef.current?.start();
      } catch {
        /* already started */
      }
    }, 150);
  }, []);

  const stopMicRef = useRef<() => void>(() => undefined);

  const handleSpeechDone = useCallback(() => {
    if (statusRef.current !== 'speaking') return;
    if (micRef.current) {
      resumeListening();
    } else {
      setStatus('idle');
    }
  }, [resumeListening]);

  const speak = useCallback(
    (text: string, lang: VoiceLanguage) => {
      if (!('speechSynthesis' in window)) {
        // Озвучення недоступне (наприклад, iOS у тихому режимі) — просто завершуємо хід.
        handleSpeechDone();
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_CODES[lang];
      const voice = pickVoice(lang);
      if (voice) utterance.voice = voice;
      utterance.volume = settingsRef.current.volume;
      utterance.rate = settingsRef.current.rate;
      utterance.onend = handleSpeechDone;
      utterance.onerror = handleSpeechDone;
      setStatus('speaking');
      synth.speak(utterance);
    },
    [handleSpeechDone, pickVoice],
  );

  const send = useCallback(
    async (text: string, lang: VoiceLanguage) => {
      const clean = text.trim();
      if (!clean || statusRef.current === 'thinking' || statusRef.current === 'speaking') return;
      finalBufferRef.current = '';
      setInterim('');
      window.clearTimeout(finalizeTimerRef.current);
      silenceRecognition();

      if (!apiKeyRef.current.trim()) {
        setError('Щоб голосовий асистент відповідав, підключи ключ OpenRouter у налаштуваннях.');
        if (micRef.current) resumeListening();
        else setStatus('idle');
        return;
      }

      const userMessage: VoiceMessage = { id: nextMessageId('user'), role: 'user', text: clean, lang, at: Date.now() };
      const next = [...messagesRef.current, userMessage];
      messagesRef.current = next;
      setMessages(next);

      setStatus('thinking');
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const reply = await requestVoiceTutorReply(
          apiKeyRef.current.trim(),
          modelRef.current,
          next.map((message) => ({ role: message.role, content: message.text })),
          controller.signal,
          contextRef.current?.(),
        );
        const assistantMessage: VoiceMessage = {
          id: nextMessageId('assistant'),
          role: 'assistant',
          text: reply.trim(),
          lang,
          at: Date.now(),
        };
        const withReply = [...messagesRef.current, assistantMessage];
        messagesRef.current = withReply;
        setMessages(withReply);
        setError(null);
        speak(assistantMessage.text, lang);
      } catch (caught) {
        if (controller.signal.aborted) {
          if (micRef.current) resumeListening();
          else setStatus('idle');
          return;
        }
        setError(describeFailure(caught));
        if (micRef.current) resumeListening();
        else setStatus('idle');
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [resumeListening, silenceRecognition, speak],
  );

  const startMic = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError(
        'Розпізнавання мовлення не підтримується цим браузером. Голосовий режим працює в Chrome та Edge (настільних і Android).',
      );
      return;
    }
    setError(null);

    void navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // ── Аналізатор рівня мікрофона для голосової сфери ──
        try {
          const AudioCtor =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (AudioCtor) {
            const audioContext = new AudioCtor();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 1024;
            source.connect(analyser);
            audioContextRef.current = audioContext;
            streamRef.current = stream;
            const data = new Uint8Array(analyser.fftSize);
            const tick = () => {
              analyser.getByteTimeDomainData(data);
              let sum = 0;
              for (let index = 0; index < data.length; index += 1) {
                const value = (data[index] - 128) / 128;
                sum += value * value;
              }
              const rms = Math.sqrt(sum / data.length);
              const level = Math.min(1, rms * 4);
              const previous = voiceLevelRef.current;
              // Швидка атака, повільне затухання.
              voiceLevelRef.current = level > previous ? level : previous * 0.88 + level * 0.12;
              meterRafRef.current = window.requestAnimationFrame(tick);
            };
            voiceLevelRef.current = 0;
            meterRafRef.current = window.requestAnimationFrame(tick);
          }
        } catch {
          /* аналізатор — опційне оформлення, без нього все працює */
        }

        const recognition = new Ctor();
        recognition.lang = LANG_CODES[settingsRef.current.language];
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          if (statusRef.current !== 'listening') return;
          let interimText = '';
          for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const result = event.results[index];
            const transcript = result[0]?.transcript ?? '';
            if (result.isFinal) {
              finalBufferRef.current = `${finalBufferRef.current} ${transcript}`.trim();
            } else {
              interimText += transcript;
            }
          }
          setInterim((interimText.trim() || finalBufferRef.current).trim());
          window.clearTimeout(finalizeTimerRef.current);
          finalizeTimerRef.current = window.setTimeout(() => {
            const text = finalBufferRef.current.trim();
            finalBufferRef.current = '';
            if (text) void send(text, settingsRef.current.language);
          }, FINALIZE_DELAY_MS);
        };

        recognition.onerror = (event) => {
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setError('Доступ до мікрофона заборонено. Дозволь його в налаштуваннях сайту (іконка замка в адресному рядку).');
            stopMicRef.current();
          }
          // 'no-speech' | 'audio-capture' | 'aborted' — очікувані, тиша/перезапуск оброблюється onend.
        };

        recognition.onend = () => {
          // Chrome періодично зупиняє continuous-розпізнавання — перезапускаємо, поки мікрофон увімкнено.
          window.clearTimeout(restartTimerRef.current);
          restartTimerRef.current = window.setTimeout(() => {
            if (!micRef.current || statusRef.current !== 'listening') return;
            try {
              recognitionRef.current?.start();
            } catch {
              /* already started */
            }
          }, 250);
        };

        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch {
          /* already started */
        }
        setMicEnabled(true);
        setStatus('listening');
      })
      .catch((caught: DOMException) => {
        if (caught.name === 'NotAllowedError' || caught.name === 'SecurityError') {
          setError('Доступ до мікрофона заборонено. Дозволь його в налаштуваннях сайту (іконка замка в адресному рядку).');
        } else if (caught.name === 'NotFoundError' || caught.name === 'DevicesNotFoundError') {
          setError('Мікрофон не знайдено. Підключи мікрофон і спробуй ще раз.');
        } else {
          setError('Не вдалося отримати доступ до мікрофона. Перевір підключення пристрою.');
        }
        setStatus('idle');
      });
  }, [send]);

  const stopMicImplementation = useCallback(() => {
    setMicEnabled(false);
    abortRef.current?.abort();
    try {
      recognitionRef.current?.abort();
    } catch {
      /* already stopped */
    }
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    window.cancelAnimationFrame(meterRafRef.current);
    voiceLevelRef.current = 0;
    window.clearTimeout(finalizeTimerRef.current);
    window.clearTimeout(restartTimerRef.current);
    finalBufferRef.current = '';
    setInterim('');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setStatus('idle');
  }, []);

  useEffect(() => {
    stopMicRef.current = stopMicImplementation;
  }, [stopMicImplementation]);

  /** Переривання відповіді асистента (кнопка або клік по сфері). */
  const stopSpeaking = useCallback(() => {
    abortRef.current?.abort();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (micRef.current) resumeListening();
    else setStatus('idle');
  }, [resumeListening]);

  const clearHistory = useCallback(() => {
    abortRef.current?.abort();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (storageKey) window.localStorage.removeItem(storageKey);
    finalBufferRef.current = '';
    setInterim('');
    setMessages([]);
    setError(null);
    if (!micRef.current) setStatus('idle');
  }, [storageKey]);

  const startMicRef = useRef(startMic);
  startMicRef.current = startMic;

  const sendMessage = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (statusRef.current === 'speaking') {
        // Текстове повідомлення теж перериває поточну відповідь.
        abortRef.current?.abort();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        setStatus('idle');
      }
      void send(clean, settingsRef.current.language);
    },
    [send],
  );

  const updateSettings = useCallback((patch: Partial<VoiceSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      if (recognitionRef.current && patch.language && patch.language !== current.language) {
        recognitionRef.current.lang = LANG_CODES[patch.language];
      }
      return next;
    });
  }, []);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      try {
        recognitionRef.current?.abort();
      } catch {
        /* noop */
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      window.cancelAnimationFrame(meterRafRef.current);
      window.clearTimeout(finalizeTimerRef.current);
      window.clearTimeout(restartTimerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      void audioContextRef.current?.close().catch(() => undefined);
    },
    [],
  );

  return {
    status,
    micEnabled,
    interim,
    messages,
    error,
    settings,
    voiceLevelRef,
    startMic: () => startMicRef.current(),
    stopMic: stopMicImplementation,
    stopSpeaking,
    clearHistory,
    sendMessage,
    updateSettings,
    dismissError: () => setError(null),
  };
}
