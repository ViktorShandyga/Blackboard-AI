export interface FreeModelOption {
  id: string;
  label: string;
  hint: string;
}

export const FREE_MODEL_OPTIONS: FreeModelOption[] = [
  {
    id: 'openrouter/free',
    label: 'Авто-вибір',
    hint: 'Маршрутизатор сам обере доступну безкоштовну модель. Рекомендовано.',
  },
  {
    id: 'nvidia/nemotron-3.5-super-vl:free',
    label: 'Nemotron 3.5 Super VL',
    hint: 'Модель NVIDIA, що розуміє і текст, і зображення.',
  },
  {
    id: 'dots-studio/dots-3-note-preview:free',
    label: 'Dots3 Note Preview',
    hint: 'Модель Dots Studio для текстових пояснень.',
  },
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    label: 'Nemotron 3.5 Lightning',
    hint: 'Швидка модель NVIDIA для коротких відповідей.',
  },
  {
    id: 'nvidia/nemotron-3.5-content-safety:free',
    label: 'Nemotron 3.5 Content Safety',
    hint: 'Модель перевірки безпеки тексту, а не для навчальних пояснень. Може не підійти.',
  },
];

const MODEL_STORAGE_KEY = 'blackboard-ai:openrouter-model';
export const DEFAULT_MODEL_ID = 'openrouter/free';

export function loadModelId(): string {
  try {
    const stored = window.localStorage.getItem(MODEL_STORAGE_KEY);
    return FREE_MODEL_OPTIONS.some((option) => option.id === stored) ? (stored as string) : DEFAULT_MODEL_ID;
  } catch {
    return DEFAULT_MODEL_ID;
  }
}

export function saveModelId(id: string): void {
  window.localStorage.setItem(MODEL_STORAGE_KEY, id);
}
