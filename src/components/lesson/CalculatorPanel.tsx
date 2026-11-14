import { Delete, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { CALCULATOR_XP_COST, evaluateExpression } from '@/lib/calculator';

interface CalculatorPanelProps {
  onClose: () => void;
}

interface CalcKey {
  label: string;
  /** Символ, що додається до виразу (для ÷ × це «/» та «×» — зберігаємо красиво). */
  insert?: string;
  action?: 'clear' | 'backspace' | 'equals';
  kind: 'digit' | 'op' | 'clear' | 'equals';
  wide?: boolean;
}

const KEYS: CalcKey[][] = [
  [
    { label: 'C', action: 'clear', kind: 'clear' },
    { label: '(', insert: '(', kind: 'op' },
    { label: ')', insert: ')', kind: 'op' },
    { label: '÷', insert: '÷', kind: 'op' },
  ],
  [
    { label: '7', insert: '7', kind: 'digit' },
    { label: '8', insert: '8', kind: 'digit' },
    { label: '9', insert: '9', kind: 'digit' },
    { label: '×', insert: '×', kind: 'op' },
  ],
  [
    { label: '4', insert: '4', kind: 'digit' },
    { label: '5', insert: '5', kind: 'digit' },
    { label: '6', insert: '6', kind: 'digit' },
    { label: '−', insert: '−', kind: 'op' },
  ],
  [
    { label: '1', insert: '1', kind: 'digit' },
    { label: '2', insert: '2', kind: 'digit' },
    { label: '3', insert: '3', kind: 'digit' },
    { label: '+', insert: '+', kind: 'op' },
  ],
  [
    { label: '0', insert: '0', kind: 'digit' },
    { label: ',', insert: ',', kind: 'digit' },
    { label: '%', insert: '%', kind: 'op' },
    { label: '⌫', action: 'backspace', kind: 'op' },
  ],
  [{ label: '=', action: 'equals', kind: 'equals', wide: true }],
];

export function CalculatorPanel({ onClose }: CalculatorPanelProps) {
  const [expression, setExpression] = useState('');
  const [error, setError] = useState(false);
  // Джерело правди для обробників — синхронний ref, щоб швидкі натискання не губили стани.
  const expressionRef = useRef('');
  const justEvaluatedRef = useRef(false);

  const write = (next: string) => {
    expressionRef.current = next;
    setExpression(next);
  };

  const append = (value: string) => {
    setError(false);
    const isOperator = '+−×÷%('.includes(value);
    // Після «=» цифра починає новий вираз, оператор — продовжує з результатом.
    write(justEvaluatedRef.current && !isOperator ? value : expressionRef.current + value);
    justEvaluatedRef.current = false;
  };

  const clearAll = () => {
    setError(false);
    justEvaluatedRef.current = false;
    write('');
  };

  const backspace = () => {
    setError(false);
    justEvaluatedRef.current = false;
    write(expressionRef.current.slice(0, -1));
  };

  const equals = () => {
    if (!expressionRef.current) return;
    try {
      const value = evaluateExpression(expressionRef.current);
      write(String(value));
      setError(false);
      justEvaluatedRef.current = true;
    } catch {
      setError(true);
    }
  };

  const handleKey = (key: CalcKey) => {
    if (key.action === 'clear') return clearAll();
    if (key.action === 'backspace') return backspace();
    if (key.action === 'equals') return equals();
    if (key.insert) return append(key.insert);
  };

  return (
    <div className="glass-card relative overflow-hidden p-4 shadow-glass-lg">
      <div className="glass-edge" />
      <div className="relative flex items-center justify-between gap-2 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-300">Калькулятор</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-silver transition-colors hover:bg-white/[0.06] hover:text-ink"
          aria-label="Закрити калькулятор"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Дисплей */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-canvas/80 px-4 py-3">
        <div className="min-h-[2.4rem] overflow-x-auto whitespace-nowrap text-right font-display text-2xl tabular-nums [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {error ? <span className="text-danger">Помилка</span> : (expression || '0')}
        </div>
      </div>

      {/* Клавіатура */}
      <div className="relative mt-3 grid grid-cols-4 gap-1.5">
        {KEYS.flatMap((row, rowIndex) =>
          row.map((key, keyIndex) => (
            <button
              key={`${rowIndex}-${keyIndex}`}
              type="button"
              onClick={() => handleKey(key)}
              className={`flex h-11 items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-95 ${
                key.wide ? 'col-span-4' : ''
              } ${
                key.kind === 'equals'
                  ? 'border-transparent bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 text-white shadow-[0_10px_26px_-10px_rgba(79,70,229,0.9)] hover:brightness-110'
                  : key.kind === 'clear'
                    ? 'border-rose-300/20 bg-rose-400/[0.08] text-rose-200 hover:border-rose-300/40'
                    : key.kind === 'op'
                      ? 'border-sky-400/20 bg-sky-400/[0.08] text-sky-200 hover:border-sky-400/40 hover:bg-sky-400/[0.14]'
                      : 'border-white/[0.08] bg-white/[0.05] text-ink hover:border-white/20 hover:bg-white/[0.09]'
              }`}
            >
              {key.action === 'backspace' ? <Delete className="h-4 w-4" /> : key.label}
            </button>
          )),
        )}
      </div>

      <p className="relative mt-2.5 text-center text-[10px] text-silver/60">
        Активовано за {CALCULATOR_XP_COST} XP · діє до наступного завдання
      </p>
    </div>
  );
}
