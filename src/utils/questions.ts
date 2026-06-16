import { Question, Language, Difficulty } from '../types';
import pythonBeginner from '../data/python_beginner.json';
import pythonBeginnerExtra from '../data/python_beginner_extra.json';
import pythonIntermediate from '../data/python_intermediate.json';
import jsBeginner from '../data/js_beginner.json';
import jsIntermediate from '../data/js_intermediate.json';
import htmlBeginner from '../data/html_beginner.json';
import htmlIntermediate from '../data/html_intermediate.json';
import bank01 from '../data/bank_01.json';
import bank02 from '../data/bank_02.json';
import bank03 from '../data/bank_03.json';
import bank04 from '../data/bank_04.json';
import bank05 from '../data/bank_05.json';
import bank06 from '../data/bank_06.json';
import bank07 from '../data/bank_07.json';
import bank08 from '../data/bank_08.json';
import bank09 from '../data/bank_09.json';
import bank10 from '../data/bank_10.json';

const ALL_QUESTIONS: Question[] = [
  ...(pythonBeginner as Question[]),
  ...(pythonBeginnerExtra as Question[]),
  ...(pythonIntermediate as Question[]),
  ...(jsBeginner as Question[]),
  ...(jsIntermediate as Question[]),
  ...(htmlBeginner as Question[]),
  ...(htmlIntermediate as Question[]),
];

const BANKS: Record<number, Question[]> = {
  1: bank01 as Question[],
  2: bank02 as Question[],
  3: bank03 as Question[],
  4: bank04 as Question[],
  5: bank05 as Question[],
  6: bank06 as Question[],
  7: bank07 as Question[],
  8: bank08 as Question[],
  9: bank09 as Question[],
  10: bank10 as Question[],
};

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

export function getBankQuestions(bankId: number): Question[] {
  const pool = BANKS[bankId] ?? [];
  return fisherYates(pool);
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
