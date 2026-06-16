'use client';

import type { GradeResult } from '../types';
import styles from './ScoreBar.module.css';

interface Props {
  currentIndex: number;
  total: number;
  results: (GradeResult | null)[];
}

export default function ScoreBar({ currentIndex, total, results }: Props) {
  const correct = results.filter((r) => r?.passed).length;
  const done = results.filter((r) => r !== null).length;

  return (
    <div className={styles.bar}>
      <span className={styles.label}>{`Q${currentIndex + 1}/${total}`}</span>
      <div className={styles.track}>
        {Array.from({ length: total }).map((_, i) => {
          const r = results[i];
          let cls = styles.dot;
          if (r !== null) cls = r.passed ? styles.dotCorrect : styles.dotWrong;
          else if (i === currentIndex) cls = styles.dotActive;
          return <span key={i} className={cls} />;
        })}
      </div>
      {done > 0 && (
        <span className={styles.score}>
          <span className={styles.correct}>{correct}</span>
          <span className={styles.sep}>/</span>
          <span className={styles.incorrect}>{done - correct}</span>
        </span>
      )}
    </div>
  );
}
