'use client';

import type { GradeResult, Question } from '../types';
import styles from './ResultPanel.module.css';

interface Props {
  result: GradeResult;
  question: Question;
  showBugCount: boolean;
  onNext: () => void;
}

const DIVIDER = '════════════════════════════════';

export default function ResultPanel({ result, question, showBugCount, onNext }: Props) {
  const { passed, usedGiveUp, lineStates } = result;
  const hasBugs = question.bugs.length > 0;

  let statusText: string;
  let statusColor: string;
  let borderColor: string;
  let detailLine: string | null = null;

  if (usedGiveUp) {
    statusText = 'ANSWER REVEALED';
    statusColor = 'var(--brand)';
    borderColor = 'var(--brand)';
    const lines = question.bugs.flatMap(b => b.lines);
    detailLine = lines.length > 0 ? `LINE: ${lines.join(', ')}` : 'NO BUGS PRESENT';
  } else if (passed) {
    statusText = 'STATUS: CORRECT';
    statusColor = 'var(--success)';
    borderColor = 'var(--success)';
    if (!hasBugs) {
      detailLine = 'NO BUGS PRESENT';
    } else {
      const lines = question.bugs.flatMap(b => b.lines);
      detailLine = `LINE: ${lines.join(', ')}`;
    }
  } else {
    statusText = 'STATUS: INCORRECT';
    statusColor = 'var(--error)';
    borderColor = 'var(--error)';
    const missed = Object.entries(lineStates).filter(([, s]) => s === 'missed').map(([n]) => n);
    const fp = Object.entries(lineStates).filter(([, s]) => s === 'false_positive').map(([n]) => n);
    if (!hasBugs && fp.length > 0) {
      detailLine = `YOUR SELECTION: line${fp.length > 1 ? 's' : ''} ${fp.join(', ')}`;
    } else if (missed.length > 0) {
      detailLine = `ACTUAL BUG: line${missed.length > 1 ? 's' : ''} ${missed.join(', ')}`;
    } else if (fp.length > 0) {
      detailLine = `FALSE POSITIVE: line${fp.length > 1 ? 's' : ''} ${fp.join(', ')}`;
    }
  }

  return (
    <div className={styles.panel} style={{ borderLeftColor: borderColor }}>
      <div className={styles.resultInner}>
        <p className={styles.divider}>{DIVIDER}</p>
        <p className={styles.status} style={{ color: statusColor }}>{statusText}</p>
        {detailLine && <p className={styles.detail}>{detailLine}</p>}
        {showBugCount && !usedGiveUp && (
          <p className={styles.bugCount}>BUG COUNT: {question.bugs.length}</p>
        )}
        <p className={styles.divider}>{DIVIDER}</p>

        {question.bugs.length === 0 ? (
          <p className={styles.explanation}>
            This was a clean snippet. Recognizing correct code is part of the challenge.
          </p>
        ) : (
          question.bugs.map((bug, i) => (
            <div key={i} className={styles.bugBlock}>
              {question.bugs.length > 1 && (
                <p className={styles.bugLabel}>
                  {`BUG ${i + 1}  ·  LINE${bug.lines.length > 1 ? 'S' : ''} ${bug.lines.join(', ')}`}
                </p>
              )}
              <p className={styles.explanation}>{bug.explanation}</p>
            </div>
          ))
        )}

        <p className={styles.divider}>{DIVIDER}</p>
      </div>

      <button className={styles.nextBtn} onClick={onNext}>
        {'[NEXT QUESTION ▶]'}
      </button>
    </div>
  );
}
