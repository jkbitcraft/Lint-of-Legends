import { Question, GradeResult, LineState } from '../types';

export function grade(
  question: Question,
  selectedLines: number[],
  usedNoBugs: boolean,
): GradeResult {
  const allBugLines = new Set(question.bugs.flatMap((b) => b.lines));
  const selected = new Set(selectedLines);
  const lineStates: Record<number, LineState> = {};
  const totalLines = question.code.split('\n').length;

  if (usedNoBugs) {
    if (question.bugs.length === 0) {
      return { passed: true, lineStates: {}, usedGiveUp: false };
    }
    for (const line of allBugLines) {
      lineStates[line] = 'missed';
    }
    return { passed: false, lineStates, usedGiveUp: false };
  }

  for (let line = 1; line <= totalLines; line++) {
    const isBug = allBugLines.has(line);
    const isSelected = selected.has(line);
    if (isBug && isSelected) {
      lineStates[line] = 'correct';
    } else if (isBug && !isSelected) {
      lineStates[line] = 'missed';
    } else if (!isBug && isSelected) {
      lineStates[line] = 'false_positive';
    }
  }

  const missed = Object.values(lineStates).some((s) => s === 'missed');
  const fp = Object.values(lineStates).some((s) => s === 'false_positive');
  return { passed: !missed && !fp, lineStates, usedGiveUp: false };
}

export function reveal(question: Question): GradeResult {
  const lineStates: Record<number, LineState> = {};
  for (const bug of question.bugs) {
    for (const line of bug.lines) {
      lineStates[line] = 'revealed';
    }
  }
  return { passed: false, lineStates, usedGiveUp: true };
}
