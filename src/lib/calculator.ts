/** Вартість активації калькулятора в балах (XP). */
export const CALCULATOR_XP_COST = 10;

interface Token {
  type: 'number' | 'op' | 'lparen' | 'rparen';
  value: string;
}

/** Розбір рядка на числа й оператори; підтримує символи × ÷ − та кому як десятковий розділювач. */
function tokenize(input: string): Token[] {
  const clean = input
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/,/g, '.');

  const tokens: Token[] = [];
  let index = 0;
  while (index < clean.length) {
    const char = clean[index];
    if (char === ' ') {
      index += 1;
      continue;
    }
    if (/[0-9.]/.test(char)) {
      let number = '';
      while (index < clean.length && /[0-9.]/.test(clean[index])) {
        number += clean[index];
        index += 1;
      }
      if ((number.match(/\./g) ?? []).length > 1) throw new Error('Invalid number');
      tokens.push({ type: 'number', value: number });
      continue;
    }
    if ('+-*/%'.includes(char)) {
      tokens.push({ type: 'op', value: char });
      index += 1;
      continue;
    }
    if (char === '(') {
      tokens.push({ type: 'lparen', value: char });
      index += 1;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'rparen', value: char });
      index += 1;
      continue;
    }
    throw new Error('Unexpected character');
  }
  return tokens;
}

/** Рекурсивний спуск: expression → term → unary → primary. Без eval(). */
class Parser {
  private position = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): number {
    if (this.tokens.length === 0) throw new Error('Empty expression');
    const value = this.expression();
    if (this.position !== this.tokens.length) throw new Error('Unexpected token');
    return value;
  }

  private peek(): Token | undefined {
    return this.tokens[this.position];
  }

  private expression(): number {
    let value = this.term();
    for (;;) {
      const token = this.peek();
      if (token?.type === 'op' && (token.value === '+' || token.value === '-')) {
        this.position += 1;
        const right = this.term();
        value = token.value === '+' ? value + right : value - right;
      } else {
        return value;
      }
    }
  }

  private term(): number {
    let value = this.unary();
    for (;;) {
      const token = this.peek();
      if (token?.type === 'op' && '*/%'.includes(token.value)) {
        this.position += 1;
        const right = this.unary();
        if ((token.value === '/' || token.value === '%') && right === 0) {
          throw new Error('Division by zero');
        }
        value = token.value === '*' ? value * right : token.value === '/' ? value / right : value % right;
      } else {
        return value;
      }
    }
  }

  private unary(): number {
    const token = this.peek();
    if (token?.type === 'op' && (token.value === '-' || token.value === '+')) {
      this.position += 1;
      const value = this.unary();
      return token.value === '-' ? -value : value;
    }
    return this.primary();
  }

  private primary(): number {
    const token = this.peek();
    if (!token) throw new Error('Unexpected end');
    if (token.type === 'number') {
      this.position += 1;
      const value = Number(token.value);
      if (!Number.isFinite(value)) throw new Error('Invalid number');
      return value;
    }
    if (token.type === 'lparen') {
      this.position += 1;
      const value = this.expression();
      if (this.peek()?.type !== 'rparen') throw new Error('Missing closing bracket');
      this.position += 1;
      return value;
    }
    throw new Error('Unexpected token');
  }
}

/** Обчислює арифметичний вираз калькулятора; кидає помилку на некоректний ввід. */
export function evaluateExpression(raw: string): number {
  const value = new Parser(tokenize(raw)).parse();
  if (!Number.isFinite(value)) throw new Error('Invalid result');
  // Прибираємо шуми IEEE754 на кшталт 0.1+0.2=0.30000000000000004.
  return Math.round(value * 1e10) / 1e10;
}
