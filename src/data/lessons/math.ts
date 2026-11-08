import type { SubjectContent } from '@/types/learning';

export const math: SubjectContent = {
  id: 'math',
  name: 'Математика',
  description: 'Алгебра, рівняння та геометрія без зайвих складнощів.',
  topics: [
    {
      id: 'math-linear',
      title: 'Лінійні рівняння',
      points: [
        'Лінійне рівняння має вигляд ax + b = c, де x - невідоме.',
        'Щоб знайти x, переносимо числа в один бік і ділимо на коефіцієнт при x.',
        'Те, що робимо з однією частиною рівняння, треба робити і з другою.',
      ],
      example: '3x + 5 = 20  ->  3x = 15  ->  x = 5.',
      questions: [
        {
          id: 'math-linear-1',
          difficulty: 'easy',
          prompt: 'Чому дорівнює x у рівнянні x + 7 = 12?',
          options: ['5', '7', '19', '4'],
          correct: 0,
          explanation: 'Віднімаємо 7 від обох частин: x = 12 - 7 = 5.',
        },
        {
          id: 'math-linear-2',
          difficulty: 'medium',
          prompt: 'Розв’яжіть рівняння 4x - 9 = 15.',
          options: ['6', '4', '24', '1,5'],
          correct: 0,
          explanation: 'Додаємо 9: 4x = 24, далі ділимо на 4 і отримуємо x = 6.',
        },
        {
          id: 'math-linear-3',
          difficulty: 'medium',
          prompt: 'Знайдіть x: 2(x - 3) = 10.',
          options: ['8', '5', '13', '2'],
          correct: 0,
          explanation: 'Спочатку ділимо на 2: x - 3 = 5, отже x = 8.',
        },
        {
          id: 'math-linear-4',
          difficulty: 'hard',
          prompt: 'Розв’яжіть рівняння 3x + 4 = x - 8.',
          options: ['-6', '-2', '6', '-12'],
          correct: 0,
          explanation: 'Переносимо x вліво, а числа вправо: 2x = -12, тобто x = -6.',
        },
      ],
    },
    {
      id: 'math-geometry',
      title: 'Площа та периметр',
      points: [
        'Периметр - сума довжин усіх сторін фігури.',
        'Площа прямокутника дорівнює добутку довжини на ширину: S = a × b.',
        'Площа трикутника дорівнює половині добутку основи на висоту.',
      ],
      example: 'Прямокутник 6 см × 4 см: P = 2 × (6 + 4) = 20 см, S = 6 × 4 = 24 см².',
      questions: [
        {
          id: 'math-geometry-1',
          difficulty: 'easy',
          prompt: 'Чому дорівнює периметр квадрата зі стороною 5 см?',
          options: ['20 см', '25 см', '10 см', '15 см'],
          correct: 0,
          explanation: 'У квадрата чотири рівні сторони, тому P = 4 × 5 = 20 см.',
        },
        {
          id: 'math-geometry-2',
          difficulty: 'medium',
          prompt: 'Яка площа трикутника з основою 10 см і висотою 6 см?',
          options: ['30 см²', '60 см²', '16 см²', '20 см²'],
          correct: 0,
          explanation: 'S = (10 × 6) / 2 = 30 см².',
        },
        {
          id: 'math-geometry-3',
          difficulty: 'medium',
          prompt: 'Прямокутник має периметр 30 см, а одна його сторона 8 см. Яка площа прямокутника?',
          options: ['56 см²', '112 см²', '64 см²', '44 см²'],
          correct: 0,
          explanation: 'Друга сторона: 15 - 8 = 7 см. Площа: 8 × 7 = 56 см².',
        },
        {
          id: 'math-geometry-4',
          difficulty: 'hard',
          prompt: 'Коло має радіус 3 см. Яка його довжина, якщо взяти π ≈ 3,14?',
          options: ['18,84 см', '9,42 см', '28,26 см', '6 см'],
          correct: 0,
          explanation: 'Довжина кола C = 2πr = 2 × 3,14 × 3 = 18,84 см.',
        },
      ],
    },
  ],
};
