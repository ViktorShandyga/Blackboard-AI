import type { SubjectContent } from '@/types/learning';

export const english: SubjectContent = {
  id: 'english',
  name: 'Англійська мова',
  description: 'Граматика, часи дієслів і поширена лексика.',
  topics: [
    {
      id: 'en-present-simple',
      title: 'Present Simple',
      points: [
        'Present Simple вживаємо для регулярних дій і фактів: I work every day.',
        'У третій особі однини (he, she, it) додаємо -s або -es: she works.',
        'Для заперечень і питань використовуємо do/does: Does he live here?',
      ],
      example: 'She reads books every evening. - Вона читає книжки щовечора.',
      questions: [
        {
          id: 'en-ps-1',
          difficulty: 'easy',
          prompt: 'Виберіть правильну форму: She ___ coffee every morning.',
          options: ['drink', 'drinks', 'drinking', 'drank'],
          correct: 1,
          explanation: 'У третій особі однини в Present Simple додаємо -s: she drinks.',
        },
        {
          id: 'en-ps-2',
          difficulty: 'medium',
          prompt: 'Яке речення є питанням у Present Simple?',
          options: ['Do you like music?', 'You like music?', 'Are you like music?', 'Liking you music?'],
          correct: 0,
          explanation: 'Питання з you будуються з допоміжним дієсловом do: Do you like music?',
        },
        {
          id: 'en-ps-3',
          difficulty: 'medium',
          prompt: 'Як правильно заперечити речення «He plays football»?',
          options: ['He not plays football', 'He doesn’t play football', 'He don’t plays football', 'He isn’t play football'],
          correct: 1,
          explanation: 'У третій особі однини заперечення має вигляд doesn’t + базова форма дієслова.',
        },
        {
          id: 'en-ps-4',
          difficulty: 'hard',
          prompt: 'Виберіть правильне речення про дію, що відбулася вчора:',
          options: ['I go to school yesterday', 'I went to school yesterday', 'I am going to school yesterday', 'I goes to school yesterday'],
          correct: 1,
          explanation: 'Для дій у минулому використовуємо Past Simple: went - це минула форма дієслова go.',
        },
      ],
    },
    {
      id: 'en-vocabulary',
      title: 'Побутова лексика',
      points: [
        'Слова про дім: kitchen - кухня, bedroom - спальня, living room - вітальня.',
        'Слова про одяг: jacket - куртка, shoes - взуття, dress - сукня.',
        'Корисні прикметники: cold - холодний, warm - теплий, expensive - дорогий.',
      ],
      example: 'It is cold today, so I will wear a warm jacket. - Сьогодні холодно, тому я одягну теплу куртку.',
      questions: [
        {
          id: 'en-voc-1',
          difficulty: 'easy',
          prompt: 'Що означає слово «kitchen»?',
          options: ['Спальня', 'Кухня', 'Ванна', 'Коридор'],
          correct: 1,
          explanation: 'Kitchen перекладається як «кухня».',
        },
        {
          id: 'en-voc-2',
          difficulty: 'medium',
          prompt: 'Яке слово означає «куртка»?',
          options: ['Dress', 'Shoes', 'Jacket', 'Hat'],
          correct: 2,
          explanation: 'Jacket - це куртка; dress означає сукню, hat - капелюх.',
        },
        {
          id: 'en-voc-3',
          difficulty: 'medium',
          prompt: 'Який прикметник означає «дорогий»?',
          options: ['Cheap', 'Expensive', 'Warm', 'Quiet'],
          correct: 1,
          explanation: 'Expensive означає дорогий, а cheap - дешевий.',
        },
        {
          id: 'en-voc-4',
          difficulty: 'hard',
          prompt: 'Яке слово найкраще підходить: «The ___ is where we sleep»?',
          options: ['Bedroom', 'Kitchen', 'Garden', 'Garage'],
          correct: 0,
          explanation: 'Bedroom - спальня, де люди сплять.',
        },
      ],
    },
  ],
};
