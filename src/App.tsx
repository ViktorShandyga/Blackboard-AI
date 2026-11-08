import { MotionConfig } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { AchievementToast } from '@/components/common/AchievementToast';
import { QuestToast, type DailyQuestToast } from '@/components/common/QuestToast';
import { getAchievements, type Achievement } from '@/lib/achievements';
import { applyDailyQuestRewards, selectDailyQuestIds } from '@/lib/dailyQuests';
import { ErrorNotice } from '@/components/home/ErrorNotice';
import { HomePage } from '@/components/home/HomePage';
import { LessonView } from '@/components/lesson/LessonView';
import { LessonSummary } from '@/components/lesson/LessonSummary';
import { MusicPlayer } from '@/components/music/MusicPlayer';
import { NotesPage } from '@/components/notes/NotesPage';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { TopBar } from '@/components/layout/TopBar';
import { getSubject } from '@/data/lessons';
import { clearApiKey, loadApiKey, saveApiKey } from '@/lib/apiKeyStorage';
import { buildLocalLesson } from '@/lib/localLesson';
import { generateAiLesson } from '@/lib/lessonAi';
import { DEFAULT_MODEL_ID, loadModelId, saveModelId } from '@/lib/openrouterModels';
import { dateKey, loadProgress, recordLesson, saveProgress, type Progress } from '@/lib/progressStorage';
import { VoiceAIPage } from '@/components/voice/VoiceAIPage';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import type {
  LessonFocus,
  LessonSession,
  Level,
  QuestionCount,
  SubjectContent,
  SubjectId,
  TaskResult,
} from '@/types/learning';

const AI_TIMEOUT_MS = 60_000;

type Screen =
  | { kind: 'home' }
  | { kind: 'lesson'; session: LessonSession }
  | { kind: 'summary'; session: LessonSession; results: TaskResult[] }
  | { kind: 'notes' }
  | { kind: 'voice' };

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [apiKey, setApiKey] = useState<string>(loadApiKey);
  const [model, setModel] = useState<string>(loadModelId);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [subjectId, setSubjectId] = useState<SubjectId | null>(null);
  const [focus, setFocus] = useState<LessonFocus>({ kind: 'mix' });
  const [level, setLevel] = useState<Level>('medium');
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [screen, setScreen] = useState<Screen>({ kind: 'home' });
  const [isLoading, setIsLoading] = useState(false);
  const lastFailedAttempt = useRef<(() => void) | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const player = useMusicPlayer();
  const [achievementToasts, setAchievementToasts] = useState<Achievement[]>([]);
  const progressScanCount = useRef(0);

  useEffect(() => {
    const isFirstScan = progressScanCount.current === 0;
    progressScanCount.current += 1;

    const fresh = getAchievements(progress).filter(
      (achievement) => achievement.unlocked && !progress.unlockedAchievements[achievement.id],
    );
    if (fresh.length === 0) return;

    // Persist unlock stamps the moment an achievement becomes unlocked.
    setProgress((prev) => {
      const stamp = new Date().toISOString();
      const stamps = Object.fromEntries(fresh.map((item) => [item.id, stamp]));
      const next = { ...prev, unlockedAchievements: { ...prev.unlockedAchievements, ...stamps } };
      saveProgress(next);
      return next;
    });

    // Silently migrate already-earned achievements on the very first scan after the update.
    if (!isFirstScan) setAchievementToasts(fresh);
  }, [progress]);

  useEffect(() => {
    if (achievementToasts.length === 0) return;
    const timers = achievementToasts.map((toast) =>
      window.setTimeout(() => dismissAchievementToast(toast.id), 7000),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [achievementToasts]);

  const dismissAchievementToast = (id: string) => {
    setAchievementToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const [questToasts, setQuestToasts] = useState<DailyQuestToast[]>([]);

  // Reset quest toasts that outlived the daily rollover.
  useEffect(() => {
    if (progress.dailyQuests?.date === dateKey()) return;
    setProgress((prev) => {
      if (prev.dailyQuests?.date === dateKey()) return prev;
      const next = { ...prev, dailyQuests: { date: dateKey(), ids: selectDailyQuestIds(dateKey()), rewardsClaimed: [] } };
      saveProgress(next);
      return next;
    });
  }, [progress]);

  const dismissQuestToast = (id: string) => {
    setQuestToasts((current) => current.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    if (questToasts.length === 0) return;
    const timers = questToasts.map((toast) => window.setTimeout(() => dismissQuestToast(toast.id), 7000));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [questToasts]);

  const selectedSubject = subjectId ? getSubject(subjectId) : undefined;

  const startOffline = (subject: SubjectContent, lessonFocus: LessonFocus, previousTaskIds: string[] = []) => {
    const session =
      buildLocalLesson(subject, lessonFocus, level, questionCount, previousTaskIds) ??
      buildLocalLesson(subject, { kind: 'mix' }, level, questionCount, previousTaskIds);
    if (!session) {
      setErrorMessage('Матеріали для цього предмета тимчасово недоступні. Спробуйте інший предмет.');
      return;
    }
    setErrorMessage(null);
    setScreen({ kind: 'lesson', session });
  };

  const startLesson = async (subject: SubjectContent, lessonFocus: LessonFocus, previousTaskIds: string[] = []) => {
    setErrorMessage(null);
    if (!apiKey) {
      if (lessonFocus.kind === 'custom') {
        setErrorMessage('Щоб вивчати власні теми, потрібен ключ OpenRouter. Додай його в налаштуваннях або обери тему зі списку.');
        return;
      }
      startOffline(subject, lessonFocus, previousTaskIds);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
    try {
      const session = await generateAiLesson(apiKey.trim(), model, subject, lessonFocus, level, questionCount, controller.signal);
      setScreen({ kind: 'lesson', session });
    } catch {
      if (model !== DEFAULT_MODEL_ID) {
        const fallbackController = new AbortController();
        const fallbackTimeoutId = window.setTimeout(() => fallbackController.abort(), AI_TIMEOUT_MS);
        try {
          const fallbackSession = await generateAiLesson(
            apiKey.trim(),
            DEFAULT_MODEL_ID,
            subject,
            lessonFocus,
            level,
            questionCount,
            fallbackController.signal,
          );
          setModel(DEFAULT_MODEL_ID);
          saveModelId(DEFAULT_MODEL_ID);
          setScreen({ kind: 'lesson', session: fallbackSession });
          return;
        } catch {
          // Continue with local materials when both AI attempts fail.
        } finally {
          window.clearTimeout(fallbackTimeoutId);
        }
      }

      if (lessonFocus.kind !== 'custom') {
        startOffline(subject, lessonFocus, previousTaskIds);
        return;
      }

      lastFailedAttempt.current = () => void startLesson(subject, lessonFocus, previousTaskIds);
      setErrorMessage(
        'Безкоштовна модель AI зараз не відповіла. Перевір ключ або обери іншу модель у налаштуваннях.',
      );
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleOpenNotes = () => {
    setErrorMessage(null);
    setScreen({ kind: 'notes' });
  };

  const handleOpenVoice = () => {
    setErrorMessage(null);
    setScreen({ kind: 'voice' });
  };

  const handleSelectSubject = (id: SubjectId) => {
    setSubjectId(id);
    setFocus({ kind: 'mix' });
  };

  const handleStart = () => {
    if (selectedSubject) void startLesson(selectedSubject, focus);
  };

  const handleTopicSearch = (subjectId: SubjectId, topicId: string) => {
    setSubjectId(subjectId);
    setFocus({ kind: 'topic', topicId });
    setErrorMessage(null);
  };

  const handleCustomTopic = (query: string) => {
    if (!selectedSubject) return;
    const customFocus: LessonFocus = { kind: 'custom', query };
    setFocus(customFocus);
    void startLesson(selectedSubject, customFocus);
  };

  const handleFinish = (results: TaskResult[]) => {
    if (screen.kind !== 'lesson') return;
    const recorded = recordLesson(progress, screen.session.subjectId, results, screen.session.tasks);
    const { progress: next, completed } = applyDailyQuestRewards(recorded);
    setProgress(next);
    saveProgress(next);
    if (completed.length > 0) {
      setQuestToasts((current) => [
        ...current,
        ...completed.map((quest) => ({
          id: quest.id,
          title: quest.title,
          description: quest.description,
          icon: quest.icon,
          reward: quest.reward,
        })),
      ]);
    }
    setScreen({ kind: 'summary', session: screen.session, results });
  };

  const handleRetry = () => {
    if (screen.kind !== 'summary') return;
    const subject = getSubject(screen.session.subjectId);
    if (!subject) return;
    void startLesson(subject, focus, screen.session.tasks.map((task) => task.id));
  };

  const handleErrorRetry = () => {
    const retry = lastFailedAttempt.current;
    setErrorMessage(null);
    retry?.();
  };

  const handleOfflineStart = () => {
    if (selectedSubject) startOffline(selectedSubject, focus);
  };

  const handleSaveKey = (key: string) => {
    const trimmedKey = key.trim();
    saveApiKey(trimmedKey);
    setApiKey(trimmedKey);
    setIsSettingsOpen(false);
    setErrorMessage(null);
  };

  const handleModelChange = (id: string) => {
    saveModelId(id);
    setModel(id);
  };

  const handleClearKey = () => {
    clearApiKey();
    setApiKey('');
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative min-h-screen overflow-x-hidden">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-sky-500/15 blur-[130px] animate-aurora" />
        <div className="absolute top-[20%] left-[-12%] h-[520px] w-[560px] rounded-full bg-indigo-500/15 blur-[120px] animate-aurora [animation-delay:-8s]" />
        <div className="absolute -bottom-48 right-[-14%] h-[560px] w-[680px] rounded-full bg-violet-600/15 blur-[130px] animate-aurora [animation-delay:-4s]" />
        <div className="absolute bottom-[-24%] left-[16%] h-[380px] w-[480px] rounded-full bg-teal-400/10 blur-[110px] animate-aurora [animation-delay:-14s]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        <div className="absolute inset-0 bg-noise" />
      </div>

      <TopBar
        totalPoints={progress.totalPoints}
        isConnected={Boolean(apiKey)}
        isMusicPlaying={player.isPlaying}
        onHome={() => setScreen({ kind: 'home' })}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotes={handleOpenNotes}
        onOpenMusic={() => setIsMusicOpen(true)}
        onOpenVoice={handleOpenVoice}
      />

      <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        {errorMessage ? (
          <div className="mb-8">
            <ErrorNotice
              message={errorMessage}
              onRetry={handleErrorRetry}
              onOfflineStart={handleOfflineStart}
              onDismiss={() => setErrorMessage(null)}
            />
          </div>
        ) : null}

        <div>
            {screen.kind === 'home' ? (
              <HomePage
                selectedSubject={selectedSubject}
                progressBySubject={progress.bySubject}
                progress={progress}
                focus={focus}
                level={level}
                questionCount={questionCount}
                isLoading={isLoading}
                onSelectSubject={handleSelectSubject}
                onFocusChange={setFocus}
                onLevelChange={setLevel}
                onQuestionCountChange={setQuestionCount}
                onStart={handleStart}
            onSelectTopic={handleTopicSearch}
            onCustomTopic={handleCustomTopic}
              />
            ) : null}

            {screen.kind === 'lesson' ? (
              <LessonView
                session={screen.session}
                onExit={() => setScreen({ kind: 'home' })}
                onFinish={handleFinish}
              />
            ) : null}

            {screen.kind === 'voice' ? (
              <VoiceAIPage
                apiKey={apiKey}
                model={model}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            ) : null}

            {screen.kind === 'summary' ? (
              <LessonSummary
                session={screen.session}
                results={screen.results}
                isLoading={isLoading}
                onRetry={handleRetry}
                onChooseAnother={() => setScreen({ kind: 'home' })}
              />
            ) : null}

            {screen.kind === 'notes' ? <NotesPage onBack={() => setScreen({ kind: 'home' })} /> : null}
        </div>
      </main>

      {isSettingsOpen ? (
        <SettingsModal
          apiKey={apiKey}
          model={model}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveKey}
          onModelChange={handleModelChange}
          onClear={handleClearKey}
        />
      ) : null}

      <MusicPlayer {...player} isOpen={isMusicOpen} onClose={() => setIsMusicOpen(false)} />

      <AchievementToast toasts={achievementToasts} onDismiss={dismissAchievementToast} />
      <QuestToast toasts={questToasts} onDismiss={dismissQuestToast} />
    </div>
    </MotionConfig>
  );
}
