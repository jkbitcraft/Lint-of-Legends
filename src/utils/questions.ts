import { Question, Language, Difficulty } from '../types';
import pythonBeginner from '../data/python_beginner.json';

// Add new language/difficulty imports here as question banks are added
const ALL_QUESTIONS: Question[] = [
  ...(pythonBeginner as Question[]),
];

export function getQuestions(language: Language, difficulty: Difficulty): Question[] {
  return ALL_QUESTIONS.filter(
    (q) => q.language === language && q.difficulty === difficulty,
  );
}

export function getRandomQuestion(
  language: Language,
  difficulty: Difficulty,
  excludeId?: string,
): Question | null {
  const pool = getQuestions(language, difficulty).filter((q) => q.id !== excludeId);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
