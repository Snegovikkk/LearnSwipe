// DeepSeek API клиент для генерации тестов

// Интерфейс для вопроса теста
export interface TestQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

// Информация о статусе DeepSeek API
export interface DeepSeekStatus {
  isAvailable: boolean;
  balance?: number;
  error?: string;
  lastChecked: Date;
}

// Конфигурация DeepSeek API
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Функция для проверки статуса API DeepSeek
export async function checkDeepSeekStatus(): Promise<DeepSeekStatus> {
  try {
    // Отправляем небольшой запрос для проверки доступности API
    const messages = [
      { role: "system", content: "This is a test message to check API status." },
      { role: "user", content: "Hello, are you available?" }
    ];
    
    // Попытка выполнить простой запрос
    await callDeepSeekAPI(messages, true);
    
    return {
      isAvailable: true,
      lastChecked: new Date()
    };
  } catch (error) {
    console.error("Ошибка при проверке статуса DeepSeek API:", error);
    
    // Пытаемся извлечь информацию об ошибке
    let errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      isAvailable: false,
      error: errorMessage,
      lastChecked: new Date()
    };
  }
}

// Функция для запроса к DeepSeek API
async function callDeepSeekAPI(messages: any[], isStatusCheck: boolean = false): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    // Если это проверка статуса, возвращаем ошибку, что ключ не установлен
    if (isStatusCheck) {
      throw new Error('Ключ DEEPSEEK_API_KEY не установлен в переменных окружения.');
    }
    // В других случаях можно вернуть демо-ответ или просто выбросить ошибку
    // В данном случае, мы сообщаем об ошибке
    console.error('DEEPSEEK_API_KEY is not set.');
    throw new Error('API ключ для DeepSeek не настроен.');
  }
  
  try {
    // Если это проверка статуса, используем минимальное количество токенов
    const maxTokens = isStatusCheck ? 10 : 4000;
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API запрос не удался: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Ошибка при запросе к DeepSeek API:', error);
    throw error;
  }
}

// Функция для генерации демо-вопросов (когда API недоступен)
function generateDemoQuestions(topic: string, count: number = 5): TestQuestion[] {
  // Шаблоны вопросов по разным темам
  const templates: Record<string, TestQuestion[]> = {
    // Вопросы по программированию
    "programming": [
      {
        id: "1",
        question: "Что такое JavaScript?",
        options: [
          { id: "a", text: "Язык программирования для работы с базами данных", isCorrect: false },
          { id: "b", text: "Язык программирования для создания веб-страниц и приложений", isCorrect: true },
          { id: "c", text: "Графическая библиотека для создания интерфейсов", isCorrect: false },
          { id: "d", text: "Операционная система для серверов", isCorrect: false },
        ],
        explanation: "JavaScript - это язык программирования высокого уровня, который используется для создания интерактивных веб-страниц и приложений."
      },
      {
        id: "2",
        question: "Что такое HTML?",
        options: [
          { id: "a", text: "Язык гипертекстовой разметки для создания структуры веб-страниц", isCorrect: true },
          { id: "b", text: "Язык программирования для разработки игр", isCorrect: false },
          { id: "c", text: "Система управления базами данных", isCorrect: false },
          { id: "d", text: "Протокол для обмена данными в интернете", isCorrect: false },
        ],
        explanation: "HTML (HyperText Markup Language) - это язык разметки, который используется для создания структуры веб-страниц."
      },
      {
        id: "3",
        question: "Что такое CSS?",
        options: [
          { id: "a", text: "Протокол безопасности для веб-сайтов", isCorrect: false },
          { id: "b", text: "Система управления контентом", isCorrect: false },
          { id: "c", text: "Язык стилей для оформления веб-страниц", isCorrect: true },
          { id: "d", text: "Формат для хранения данных", isCorrect: false },
        ],
        explanation: "CSS (Cascading Style Sheets) - это язык таблиц стилей, который используется для описания внешнего вида документа, написанного на HTML."
      },
      {
        id: "4",
        question: "Что такое React?",
        options: [
          { id: "a", text: "База данных для веб-приложений", isCorrect: false },
          { id: "b", text: "Библиотека JavaScript для создания пользовательских интерфейсов", isCorrect: true },
          { id: "c", text: "Язык программирования", isCorrect: false },
          { id: "d", text: "Операционная система", isCorrect: false },
        ],
        explanation: "React - это библиотека JavaScript с открытым исходным кодом для создания пользовательских интерфейсов, разработанная Facebook."
      },
      {
        id: "5",
        question: "Что такое NextJS?",
        options: [
          { id: "a", text: "Фреймворк для создания веб-приложений на React", isCorrect: true },
          { id: "b", text: "Язык программирования", isCorrect: false },
          { id: "c", text: "Система управления базами данных", isCorrect: false },
          { id: "d", text: "Плагин для React", isCorrect: false },
        ],
        explanation: "Next.js - это фреймворк для React, который предоставляет возможности для рендеринга на стороне сервера и генерации статических веб-страниц."
      }
    ],
    // Вопросы по истории
    "history": [
      {
        id: "1",
        question: "Когда началась Вторая мировая война?",
        options: [
          { id: "a", text: "1 сентября 1939 года", isCorrect: true },
          { id: "b", text: "1 сентября 1941 года", isCorrect: false },
          { id: "c", text: "22 июня 1941 года", isCorrect: false },
          { id: "d", text: "7 декабря 1941 года", isCorrect: false },
        ],
        explanation: "Вторая мировая война началась 1 сентября 1939 года с вторжения нацистской Германии в Польшу."
      },
      {
        id: "2",
        question: "Кто был первым президентом США?",
        options: [
          { id: "a", text: "Томас Джефферсон", isCorrect: false },
          { id: "b", text: "Авраам Линкольн", isCorrect: false },
          { id: "c", text: "Джордж Вашингтон", isCorrect: true },
          { id: "d", text: "Бенджамин Франклин", isCorrect: false },
        ],
        explanation: "Джордж Вашингтон был первым президентом Соединенных Штатов Америки и занимал этот пост с 1789 по 1797 год."
      },
      {
        id: "3",
        question: "Когда произошла Октябрьская революция?",
        options: [
          { id: "a", text: "Октябрь 1905 года", isCorrect: false },
          { id: "b", text: "Октябрь 1917 года", isCorrect: true },
          { id: "c", text: "Октябрь 1918 года", isCorrect: false },
          { id: "d", text: "Октябрь 1921 года", isCorrect: false },
        ],
        explanation: "Октябрьская революция произошла 25-26 октября (7-8 ноября по новому стилю) 1917 года."
      },
      {
        id: "4",
        question: "Кто открыл Америку?",
        options: [
          { id: "a", text: "Васко да Гама", isCorrect: false },
          { id: "b", text: "Христофор Колумб", isCorrect: true },
          { id: "c", text: "Фернан Магеллан", isCorrect: false },
          { id: "d", text: "Америго Веспуччи", isCorrect: false },
        ],
        explanation: "Христофор Колумб открыл Америку в 1492 году, хотя сам он считал, что достиг Индии."
      },
      {
        id: "5",
        question: "Когда закончилась Холодная война?",
        options: [
          { id: "a", text: "В 1985 году", isCorrect: false },
          { id: "b", text: "В 1989 году", isCorrect: false },
          { id: "c", text: "В 1991 году", isCorrect: true },
          { id: "d", text: "В 1993 году", isCorrect: false },
        ],
        explanation: "Холодная война официально завершилась в 1991 году с распадом Советского Союза."
      }
    ],
    // Вопросы по науке
    "science": [
      {
        id: "1",
        question: "Что является наименьшей структурной единицей живых организмов?",
        options: [
          { id: "a", text: "Атом", isCorrect: false },
          { id: "b", text: "Молекула", isCorrect: false },
          { id: "c", text: "Клетка", isCorrect: true },
          { id: "d", text: "Ткань", isCorrect: false },
        ],
        explanation: "Клетка является наименьшей структурной и функциональной единицей всех живых организмов."
      },
      {
        id: "2",
        question: "Какой химический элемент имеет символ Fe?",
        options: [
          { id: "a", text: "Фтор", isCorrect: false },
          { id: "b", text: "Фосфор", isCorrect: false },
          { id: "c", text: "Феррум (Железо)", isCorrect: true },
          { id: "d", text: "Франций", isCorrect: false },
        ],
        explanation: "Fe - это символ химического элемента Феррума, известного как Железо."
      },
      {
        id: "3",
        question: "Какой закон физики гласит, что энергия не может быть создана или уничтожена?",
        options: [
          { id: "a", text: "Закон сохранения энергии", isCorrect: true },
          { id: "b", text: "Закон Ньютона", isCorrect: false },
          { id: "c", text: "Закон Ома", isCorrect: false },
          { id: "d", text: "Закон всемирного тяготения", isCorrect: false },
        ],
        explanation: "Закон сохранения энергии гласит, что энергия не может быть создана или уничтожена, а только переходит из одной формы в другую."
      },
      {
        id: "4",
        question: "Какая планета Солнечной системы самая большая?",
        options: [
          { id: "a", text: "Земля", isCorrect: false },
          { id: "b", text: "Марс", isCorrect: false },
          { id: "c", text: "Юпитер", isCorrect: true },
          { id: "d", text: "Сатурн", isCorrect: false },
        ],
        explanation: "Юпитер является самой большой планетой Солнечной системы."
      },
      {
        id: "5",
        question: "Что измеряется в герцах (Гц)?",
        options: [
          { id: "a", text: "Сила тока", isCorrect: false },
          { id: "b", text: "Напряжение", isCorrect: false },
          { id: "c", text: "Частота", isCorrect: true },
          { id: "d", text: "Сопротивление", isCorrect: false },
        ],
        explanation: "Герц (Гц) - это единица измерения частоты, которая показывает количество колебаний в секунду."
      }
    ],
    // Вопросы по литературе
    "literature": [
      {
        id: "1",
        question: "Кто написал роман 'Война и мир'?",
        options: [
          { id: "a", text: "Федор Достоевский", isCorrect: false },
          { id: "b", text: "Лев Толстой", isCorrect: true },
          { id: "c", text: "Антон Чехов", isCorrect: false },
          { id: "d", text: "Иван Тургенев", isCorrect: false },
        ],
        explanation: "Роман 'Война и мир' был написан Львом Толстым и опубликован в 1865-1869 годах."
      },
      {
        id: "2",
        question: "Кто является автором трагедии 'Ромео и Джульетта'?",
        options: [
          { id: "a", text: "Уильям Шекспир", isCorrect: true },
          { id: "b", text: "Чарльз Диккенс", isCorrect: false },
          { id: "c", text: "Джейн Остин", isCorrect: false },
          { id: "d", text: "Оскар Уайльд", isCorrect: false },
        ],
        explanation: "Трагедия 'Ромео и Джульетта' была написана Уильямом Шекспиром примерно в 1595 году."
      },
      {
        id: "3",
        question: "Какой роман Достоевского рассказывает о студенте Раскольникове?",
        options: [
          { id: "a", text: "Идиот", isCorrect: false },
          { id: "b", text: "Братья Карамазовы", isCorrect: false },
          { id: "c", text: "Преступление и наказание", isCorrect: true },
          { id: "d", text: "Бесы", isCorrect: false },
        ],
        explanation: "Роман 'Преступление и наказание' рассказывает историю студента Родиона Раскольникова."
      },
      {
        id: "4",
        question: "Кто написал поэму 'Евгений Онегин'?",
        options: [
          { id: "a", text: "Михаил Лермонтов", isCorrect: false },
          { id: "b", text: "Александр Пушкин", isCorrect: true },
          { id: "c", text: "Николай Гоголь", isCorrect: false },
          { id: "d", text: "Иван Крылов", isCorrect: false },
        ],
        explanation: "'Евгений Онегин' - роман в стихах, написанный Александром Пушкиным в 1823-1831 годах."
      },
      {
        id: "5",
        question: "Кто является автором романа '1984'?",
        options: [
          { id: "a", text: "Джордж Оруэлл", isCorrect: true },
          { id: "b", text: "Олдос Хаксли", isCorrect: false },
          { id: "c", text: "Рэй Брэдбери", isCorrect: false },
          { id: "d", text: "Герберт Уэллс", isCorrect: false },
        ],
        explanation: "Антиутопический роман '1984' был написан Джорджем Оруэллом и опубликован в 1949 году."
      }
    ],
    // Общие вопросы (по умолчанию)
    "default": [
      {
        id: "1",
        question: "Какая планета ближе всего к Солнцу?",
        options: [
          { id: "a", text: "Венера", isCorrect: false },
          { id: "b", text: "Меркурий", isCorrect: true },
          { id: "c", text: "Марс", isCorrect: false },
          { id: "d", text: "Земля", isCorrect: false },
        ],
        explanation: "Меркурий - самая близкая к Солнцу планета Солнечной системы."
      },
      {
        id: "2",
        question: "Сколько костей в человеческом теле взрослого человека?",
        options: [
          { id: "a", text: "206", isCorrect: true },
          { id: "b", text: "180", isCorrect: false },
          { id: "c", text: "230", isCorrect: false },
          { id: "d", text: "250", isCorrect: false },
        ],
        explanation: "В теле взрослого человека насчитывается 206 костей."
      },
      {
        id: "3",
        question: "Какой элемент имеет химический символ O?",
        options: [
          { id: "a", text: "Золото", isCorrect: false },
          { id: "b", text: "Кислород", isCorrect: true },
          { id: "c", text: "Осмий", isCorrect: false },
          { id: "d", text: "Олово", isCorrect: false },
        ],
        explanation: "Химический символ O обозначает кислород."
      },
      {
        id: "4",
        question: "Какая страна является самой большой по площади?",
        options: [
          { id: "a", text: "Китай", isCorrect: false },
          { id: "b", text: "США", isCorrect: false },
          { id: "c", text: "Россия", isCorrect: true },
          { id: "d", text: "Канада", isCorrect: false },
        ],
        explanation: "Россия является самой большой страной в мире по площади."
      },
      {
        id: "5",
        question: "Какое животное является самым быстрым на земле?",
        options: [
          { id: "a", text: "Лев", isCorrect: false },
          { id: "b", text: "Гепард", isCorrect: true },
          { id: "c", text: "Сокол", isCorrect: false },
          { id: "d", text: "Антилопа", isCorrect: false },
        ],
        explanation: "Гепард - самое быстрое наземное животное, способное развивать скорость до 120 км/ч."
      }
    ]
  };

  // Определение наиболее подходящего набора вопросов
  let bestMatch = "default"; // По умолчанию используем общие вопросы
  let bestMatchScore = 0;
  
  // Проверяем, какая категория вопросов лучше всего подходит к теме
  for (const category in templates) {
    // Используем простое совпадение слов для определения темы
    const score = countMatchingWords(topic.toLowerCase(), category);
    if (score > bestMatchScore) {
      bestMatchScore = score;
      bestMatch = category;
    }
  }
  
  // Получаем набор вопросов
  let questions = templates[bestMatch] || templates["programming"];
  
  // Если запрошено больше вопросов, чем есть в шаблоне, 
  // генерируем дополнительные вопросы на основе имеющихся
  if (count > questions.length) {
    const additionalCount = count - questions.length;
    
    for (let i = 0; i < additionalCount; i++) {
      // Клонируем существующий вопрос с небольшими изменениями
      const sourceQuestion = questions[i % questions.length];
      const newQuestion = { ...sourceQuestion };
      
      // Модифицируем ID и вопрос
      newQuestion.id = String(questions.length + i + 1);
      newQuestion.question = `${newQuestion.question} (вариант ${i + 1})`;
      
      // Добавляем в массив
      questions.push(newQuestion);
    }
  }
  // Если запрошено меньше вопросов, возвращаем только часть
  else if (count < questions.length) {
    questions = questions.slice(0, count);
  }
  
  return questions;
}

// Вспомогательная функция для подсчета совпадающих слов
function countMatchingWords(text: string, pattern: string): number {
  const textWords = text.toLowerCase().split(/\s+/);
  const patternWords = pattern.toLowerCase().split(/\s+/);
  
  let count = 0;
  for (const textWord of textWords) {
    if (patternWords.includes(textWord)) {
      count++;
    }
  }
  
  return count;
}

// Функция для генерации теста на основе текста
export async function generateTest(text: string, title: string, selectedTopic: string | null = null, numberOfQuestions: number = 5): Promise<TestQuestion[]> {
  try {
    // Определяем, есть ли выбранная пользователем тема
    const topicFocus = selectedTopic 
      ? `Особый фокус должен быть на теме: "${selectedTopic}". Большинство вопросов должны быть связаны с этой темой.`
      : '';
      
    const prompt = `
    Создай тест из ${numberOfQuestions} вопросов на основе следующего текста:
    
    "${text}"
    
    Тема теста: "${title}"
    ${topicFocus}
    
    Формат ответа должен быть в JSON:
    [
      {
        "id": "1",
        "question": "Вопрос 1?",
        "options": [
          {"id": "a", "text": "Вариант A", "isCorrect": false},
          {"id": "b", "text": "Вариант B", "isCorrect": true},
          {"id": "c", "text": "Вариант C", "isCorrect": false},
          {"id": "d", text": "Вариант D", "isCorrect": false}
        ],
        "explanation": "Объяснение, почему вариант B является правильным."
      },
      // и так далее для всех вопросов
    ]
    
    Важно:
    1. Вопросы должны быть разнообразными
    2. У каждого вопроса должно быть 4 варианта ответа
    3. Только один вариант должен быть правильным (isCorrect: true)
    4. Дай короткое, но информативное объяснение правильного ответа
    5. Верни только JSON без дополнительных комментариев
    `;

    try {
      const messages = [
        { role: "system", content: "Ты - помощник для создания образовательных тестов. Отвечай только в формате JSON." },
        { role: "user", content: prompt }
      ];
      
      const content = await callDeepSeekAPI(messages);
      if (!content) throw new Error("Пустой ответ от API");

      // Извлекаем JSON из ответа
      let jsonContent = content;
      // Удаляем все кроме JSON если есть лишний текст
      const jsonStartPos = content.indexOf('[');
      const jsonEndPos = content.lastIndexOf(']') + 1;
      if (jsonStartPos >= 0 && jsonEndPos > jsonStartPos) {
        jsonContent = content.substring(jsonStartPos, jsonEndPos);
      }

      // Парсим JSON
      const questions: TestQuestion[] = JSON.parse(jsonContent);
      return questions;
    } catch (apiError) {
      console.error("Ошибка API DeepSeek, использую локальную генерацию:", apiError);
      console.log("Используется локальная генерация тестов");
      
      // Если API недоступен, используем локальную генерацию
      return generateDemoQuestions(title, numberOfQuestions);
    }
  } catch (error) {
    console.error("Ошибка при генерации теста:", error);
    // В случае любой ошибки используем локальную генерацию
    return generateDemoQuestions(title, numberOfQuestions);
  }
}

// Функция для анализа текста и извлечения ключевых тем
export async function analyzeText(text: string): Promise<string[]> {
  try {
    try {
      const messages = [
        { 
          role: "system", 
          content: "Ты - помощник для анализа образовательных текстов. Твоя задача - извлечь из текста 5-7 ключевых тем или концепций, которые могут быть интересны для создания учебного теста. Темы должны быть конкретными и релевантными содержанию. Стремись выделить разнообразные аспекты текста." 
        },
        { 
          role: "user", 
          content: `Проанализируй следующий текст и выдели 5-7 основных тем или концепций, по которым можно создать образовательный тест. Представь результат в виде маркированного списка.
          
Текст для анализа:
"${text.substring(0, 5000)}"` // Ограничиваем длину текста для API
        }
      ];
      
      const content = await callDeepSeekAPI(messages);
      if (!content) throw new Error("Пустой ответ от API");

      // Разбиваем текст на строки и фильтруем пустые
      const topics = content
        .replace(/^\s*[-•*]\s*/gm, '') // Удаляем маркеры списка
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Удаляем нумерацию в начале строки
        .filter(line => line.length > 0 && line.length < 50); // Фильтруем пустые строки и слишком длинные (которые, вероятно, не темы)

      return topics.slice(0, 7); // Берем только первые 7 тем
    } catch (apiError) {
      console.error("Ошибка API DeepSeek при анализе текста, использую локальную генерацию:", apiError);
      
      // Если API недоступен, используем улучшенный алгоритм извлечения ключевых тем
      return generateLocalTopics(text);
    }
  } catch (error) {
    console.error("Ошибка при анализе текста:", error);
    // В случае ошибки возвращаем стандартные темы
    return generateLocalTopics(text);
  }
}

// Функция для локального выделения тем из текста
function generateLocalTopics(text: string): string[] {
  // Стандартные темы для случая, если не удается извлечь из текста
  const defaultTopics = [
    "Основные концепции", 
    "Ключевые понятия", 
    "Практическое применение", 
    "Теоретические основы", 
    "История вопроса",
    "Современные подходы",
    "Перспективы развития"
  ];
  
  try {
    // Удаляем знаки препинания и приводим к нижнему регистру
    const cleanedText = text
      .toLowerCase()
      .replace(/[^\wа-яё\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Разбиваем на слова
    const words = cleanedText.split(' ');
    
    // Исключаем стоп-слова (союзы, предлоги и т.д.)
    const stopWords = [
      'и', 'в', 'на', 'с', 'по', 'к', 'у', 'от', 'для', 'из', 'о', 'об', 'за', 'над', 'под',
      'при', 'про', 'без', 'до', 'через', 'а', 'но', 'да', 'или', 'либо', 'ни', 'как', 'то',
      'что', 'не', 'ли', 'если', 'бы', 'вот', 'это', 'тот', 'там', 'так', 'только', 'еще',
      'уже', 'теперь', 'всегда', 'всего', 'весь', 'все', 'вся', 'эти', 'эта', 'кто', 'где',
      'когда', 'почему', 'зачем', 'который', 'какой', 'каждый', 'чтобы', 'потому', 'поэтому'
    ];
    
    // Считаем частоту каждого слова
    const wordFrequency: Record<string, number> = {};
    words.forEach(word => {
      if (word.length > 3 && !stopWords.includes(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
    
    // Находим наиболее часто встречающиеся слова
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 15);
    
    // Группируем близкие по смыслу слова (простой алгоритм - слова, начинающиеся одинаково)
    const wordGroups: Record<string, string[]> = {};
    sortedWords.forEach(word => {
      const prefix = word.substring(0, 4); // Используем первые 4 символа как ключ группы
      if (!wordGroups[prefix]) {
        wordGroups[prefix] = [];
      }
      wordGroups[prefix].push(word);
    });
    
    // Формируем темы из групп слов
    const topics: string[] = [];
    Object.values(wordGroups).forEach(group => {
      if (group.length > 0) {
        // Используем самое длинное слово в группе как основу темы
        const baseWord = group.sort((a, b) => b.length - a.length)[0];
        // Формируем тему с заглавной буквы
        const topic = baseWord.charAt(0).toUpperCase() + baseWord.slice(1);
        topics.push(topic);
      }
    });
    
    // Если нашли достаточно тем, возвращаем их
    if (topics.length >= 5) {
      return topics.slice(0, 7);
    }
    
    // Иначе дополняем стандартными темами
    return [...topics, ...defaultTopics].slice(0, 7);
  } catch (error) {
    console.error("Ошибка при локальном анализе текста:", error);
    return defaultTopics;
  }
}

export default {
  generateTest,
  analyzeText,
  checkDeepSeekStatus
}; 