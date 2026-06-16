import { Question, Language, Difficulty } from '../types';
import pythonBeginner from '../data/python_beginner.json';
import pythonBeginnerExtra from '../data/python_beginner_extra.json';
import pythonIntermediate from '../data/python_intermediate.json';
import jsBeginner from '../data/js_beginner.json';
import jsIntermediate from '../data/js_intermediate.json';
import htmlBeginner from '../data/html_beginner.json';
import htmlIntermediate from '../data/html_intermediate.json';

// Per-language-per-difficulty sets (s02-s10; Set 1 = existing pool)
import pyBegS02 from '../data/sets/py_beg_s02.json';
import pyBegS03 from '../data/sets/py_beg_s03.json';
import pyBegS04 from '../data/sets/py_beg_s04.json';
import pyBegS05 from '../data/sets/py_beg_s05.json';
import pyBegS06 from '../data/sets/py_beg_s06.json';
import pyBegS07 from '../data/sets/py_beg_s07.json';
import pyBegS08 from '../data/sets/py_beg_s08.json';
import pyBegS09 from '../data/sets/py_beg_s09.json';
import pyBegS10 from '../data/sets/py_beg_s10.json';

import pyIntS02 from '../data/sets/py_int_s02.json';
import pyIntS03 from '../data/sets/py_int_s03.json';
import pyIntS04 from '../data/sets/py_int_s04.json';
import pyIntS05 from '../data/sets/py_int_s05.json';
import pyIntS06 from '../data/sets/py_int_s06.json';
import pyIntS07 from '../data/sets/py_int_s07.json';
import pyIntS08 from '../data/sets/py_int_s08.json';
import pyIntS09 from '../data/sets/py_int_s09.json';
import pyIntS10 from '../data/sets/py_int_s10.json';

import jsBegS02 from '../data/sets/js_beg_s02.json';
import jsBegS03 from '../data/sets/js_beg_s03.json';
import jsBegS04 from '../data/sets/js_beg_s04.json';
import jsBegS05 from '../data/sets/js_beg_s05.json';
import jsBegS06 from '../data/sets/js_beg_s06.json';
import jsBegS07 from '../data/sets/js_beg_s07.json';
import jsBegS08 from '../data/sets/js_beg_s08.json';
import jsBegS09 from '../data/sets/js_beg_s09.json';
import jsBegS10 from '../data/sets/js_beg_s10.json';

import jsIntS02 from '../data/sets/js_int_s02.json';
import jsIntS03 from '../data/sets/js_int_s03.json';
import jsIntS04 from '../data/sets/js_int_s04.json';
import jsIntS05 from '../data/sets/js_int_s05.json';
import jsIntS06 from '../data/sets/js_int_s06.json';
import jsIntS07 from '../data/sets/js_int_s07.json';
import jsIntS08 from '../data/sets/js_int_s08.json';
import jsIntS09 from '../data/sets/js_int_s09.json';
import jsIntS10 from '../data/sets/js_int_s10.json';

import htmlBegS02 from '../data/sets/html_beg_s02.json';
import htmlBegS03 from '../data/sets/html_beg_s03.json';
import htmlBegS04 from '../data/sets/html_beg_s04.json';
import htmlBegS05 from '../data/sets/html_beg_s05.json';
import htmlBegS06 from '../data/sets/html_beg_s06.json';
import htmlBegS07 from '../data/sets/html_beg_s07.json';
import htmlBegS08 from '../data/sets/html_beg_s08.json';
import htmlBegS09 from '../data/sets/html_beg_s09.json';
import htmlBegS10 from '../data/sets/html_beg_s10.json';

import htmlIntS02 from '../data/sets/html_int_s02.json';
import htmlIntS03 from '../data/sets/html_int_s03.json';
import htmlIntS04 from '../data/sets/html_int_s04.json';
import htmlIntS05 from '../data/sets/html_int_s05.json';
import htmlIntS06 from '../data/sets/html_int_s06.json';
import htmlIntS07 from '../data/sets/html_int_s07.json';
import htmlIntS08 from '../data/sets/html_int_s08.json';
import htmlIntS09 from '../data/sets/html_int_s09.json';
import htmlIntS10 from '../data/sets/html_int_s10.json';

const ALL_QUESTIONS: Question[] = [
  ...(pythonBeginner as Question[]),
  ...(pythonBeginnerExtra as Question[]),
  ...(pythonIntermediate as Question[]),
  ...(jsBeginner as Question[]),
  ...(jsIntermediate as Question[]),
  ...(htmlBeginner as Question[]),
  ...(htmlIntermediate as Question[]),
];

// Set 1 = existing pool per lang/diff; sets 2-10 = new files
type SetMap = Record<number, Question[]>;
type DiffMap = Record<string, SetMap>;
type LangMap = Record<string, DiffMap>;

const SET_QUESTIONS: LangMap = {
  python: {
    beginner: {
      1: [...(pythonBeginner as Question[]), ...(pythonBeginnerExtra as Question[])],
      2: pyBegS02 as Question[],
      3: pyBegS03 as Question[],
      4: pyBegS04 as Question[],
      5: pyBegS05 as Question[],
      6: pyBegS06 as Question[],
      7: pyBegS07 as Question[],
      8: pyBegS08 as Question[],
      9: pyBegS09 as Question[],
      10: pyBegS10 as Question[],
    },
    intermediate: {
      1: pythonIntermediate as Question[],
      2: pyIntS02 as Question[],
      3: pyIntS03 as Question[],
      4: pyIntS04 as Question[],
      5: pyIntS05 as Question[],
      6: pyIntS06 as Question[],
      7: pyIntS07 as Question[],
      8: pyIntS08 as Question[],
      9: pyIntS09 as Question[],
      10: pyIntS10 as Question[],
    },
  },
  javascript: {
    beginner: {
      1: jsBeginner as Question[],
      2: jsBegS02 as Question[],
      3: jsBegS03 as Question[],
      4: jsBegS04 as Question[],
      5: jsBegS05 as Question[],
      6: jsBegS06 as Question[],
      7: jsBegS07 as Question[],
      8: jsBegS08 as Question[],
      9: jsBegS09 as Question[],
      10: jsBegS10 as Question[],
    },
    intermediate: {
      1: jsIntermediate as Question[],
      2: jsIntS02 as Question[],
      3: jsIntS03 as Question[],
      4: jsIntS04 as Question[],
      5: jsIntS05 as Question[],
      6: jsIntS06 as Question[],
      7: jsIntS07 as Question[],
      8: jsIntS08 as Question[],
      9: jsIntS09 as Question[],
      10: jsIntS10 as Question[],
    },
  },
  html_css: {
    beginner: {
      1: htmlBeginner as Question[],
      2: htmlBegS02 as Question[],
      3: htmlBegS03 as Question[],
      4: htmlBegS04 as Question[],
      5: htmlBegS05 as Question[],
      6: htmlBegS06 as Question[],
      7: htmlBegS07 as Question[],
      8: htmlBegS08 as Question[],
      9: htmlBegS09 as Question[],
      10: htmlBegS10 as Question[],
    },
    intermediate: {
      1: htmlIntermediate as Question[],
      2: htmlIntS02 as Question[],
      3: htmlIntS03 as Question[],
      4: htmlIntS04 as Question[],
      5: htmlIntS05 as Question[],
      6: htmlIntS06 as Question[],
      7: htmlIntS07 as Question[],
      8: htmlIntS08 as Question[],
      9: htmlIntS09 as Question[],
      10: htmlIntS10 as Question[],
    },
  },
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

export function getSetQuestions(
  language: Language,
  difficulty: Difficulty,
  setNum: number,
  count = 10,
): Question[] {
  const pool = SET_QUESTIONS[language]?.[difficulty]?.[setNum] ?? [];
  return fisherYates(pool).slice(0, count);
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
