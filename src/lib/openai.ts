// Файл для совместимости - проект перешел на DeepSeek
// Реэкспортируем необходимые типы из DeepSeek для сохранения совместимости
export type { TestQuestion } from './deepseek';

// Это заглушки функций, которые больше не используются
// Используйте аналогичные функции из './deepseek' вместо них
export async function generateTest(): Promise<any[]> {
  console.warn('Функция generateTest из openai.ts устарела. Используйте аналог из deepseek.ts');
  return [];
}

export async function analyzeText(): Promise<string[]> {
  console.warn('Функция analyzeText из openai.ts устарела. Используйте аналог из deepseek.ts');
  return [];
}
