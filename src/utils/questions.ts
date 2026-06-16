import { Question, Language, Difficulty } from '../types';
import pythonBeginner from '../data/python_beginner.json';
import pythonBeginnerExtra from '../data/python_beginner_extra.json';
import pythonIntermediate from '../data/python_intermediate.json';
import jsBeginner from '../data/js_beginner.json';
import jsIntermediate from '../data/js_intermediate.json';
import htmlBeginner from '../data/html_beginner.json';
import htmlIntermediate from '../data/html_intermediate.json';

const ALL_QUESTIONS: Question[] = [
  ...(pythonBeginner as Question[]),
  ...(pythonBeginnerExtra as Question[]),
  ...(pythonIntermediate as Question[]),
  ...(jsBeginner as Question[]),
  ...(jsIntermediate as Question[]),
  ...(htmlBeginner as Question[]),
  ...(htmlIntermediate as Question[]),
];

export function getQuestions(language: Language, difficulty: Difficulty): Question[] {
  return ALL_QUESTIONS.filter(
    (q) => q.language === language && q.difficulty === difficulty,
  );
}

function fisherYates<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function getSessionQuestions(
  language: Language,
  difficulty: Difficulty,
  count = 10,
): Question[] {
  const pool = getQuestions(language, difficulty);
  const shuffled = fisherYates(pool);
  return shuffled.slice(0, count);
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
