const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const CONNECTION_TEST_TIMEOUT_MS = 20_000;

export class OpenRouterError extends Error {
  constructor(
    readonly status: number | null,
    message: string,
  ) {
    super(message);
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function requestChatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Title': 'Blackboard AI',
    },
    body: JSON.stringify({ model, messages, temperature: 0.7 }),
    signal,
  });

  if (!response.ok) {
    throw new OpenRouterError(response.status, `OpenRouter responded with status ${response.status}`);
  }

  const data = (await response.json()) as { choices?: { message?: { content?: unknown } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || content.trim() === '') {
    throw new OpenRouterError(null, 'OpenRouter returned an empty response');
  }
  return content;
}

export type ConnectionTestResult = { ok: true; reply: string } | { ok: false; message: string };

export function describeFailure(error: unknown): string {
  if (error instanceof OpenRouterError) {
    if (error.status === 401 || error.status === 403) return 'Ключ не підходить. Перевір, що він скопійований повністю.';
    if (error.status === 429) return 'Ліміт безкоштовних запитів вичерпано. Спробуй трохи пізніше.';
    if (error.status === 404) return 'Ця модель зараз недоступна. Обери іншу модель зі списку.';
    if (error.status !== null) return `Сервіс OpenRouter відповів помилкою (код ${error.status}). Спробуй пізніше.`;
    return 'Модель не повернула відповіді. Спробуй повторити запит або обери іншу модель.';
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'Модель не відповіла вчасно. Спробуй повторити запит.';
  }
  return 'Немає з’єднання з OpenRouter. Перевір інтернет і спробуй ще раз.';
}

export async function testConnection(apiKey: string, model: string): Promise<ConnectionTestResult> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), CONNECTION_TEST_TIMEOUT_MS);
  try {
    const reply = await requestChatCompletion(
      apiKey,
      model,
      [{ role: 'user', content: 'Відповідь одним словом українською: привіт.' }],
      controller.signal,
    );
    return { ok: true, reply: reply.trim().slice(0, 120) };
  } catch (error) {
    return { ok: false, message: describeFailure(error) };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
