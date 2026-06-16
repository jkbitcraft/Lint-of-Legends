'use client';

import type { GradeResult } from '../types';
import styles from './ResultsScreen.module.css';

interface Props {
  results: (GradeResult | null)[];
  onRestart: () => void;
}

const DIVIDER = '════════════════════════════════';

export default function ResultsScreen({ results, onRestart }: Props) {
  const total = results.length;
  const correct = results.filter((r) => r?.passed).length;
  const gaveUp = results.filter((r) => r?.usedGiveUp).length;
  const pct = Math.round((correct / total) * 100);

  let verdict: string;
  let verdictColor: string;
  if (pct >= 80) { verdict = 'EXCELLENT'; verdictColor = 'var(--success)'; }
  else if (pct >= 60) { verdict = 'PASSING'; verdictColor = 'var(--brand)'; }
  else { verdict = 'NEEDS WORK'; verdictColor = 'var(--error)'; }

  return (
    <div className={styles.screen}>
      <p className={styles.divider}>{DIVIDER}</p>
      <p className={styles.title}>SESSION COMPLETE</p>
      <p className={styles.divider}>{DIVIDER}</p>

      <div className={styles.stats}>
        <p className={styles.stat}>
          <span className={styles.statLabel}>SCORE</span>
          <span className={styles.statValue} style={{ color: verdictColor }}>
            {correct}/{total}
          </span>
        </p>
        <p className={styles.stat}>
          <span className={styles.statLabel}>ACCURACY</span>
          <span className={styles.statValue} style={{ color: verdictColor }}>
            {pct}%
          </span>
        </p>
        {gaveUp > 0 && (
          <p className={styles.stat}>
            <span className={styles.statLabel}>REVEALED</span>
            <span className={styles.statValue} style={{ color: 'var(--muted)' }}>
              {gaveUp}
            </span>
          </p>
        )}
      </div>

      <p className={styles.divider}>{DIVIDER}</p>
      <p className={styles.verdict} style={{ color: verdictColor }}>
        {`// VERDICT: ${verdict}`}
      </p>
      <p className={styles.divider}>{DIVIDER}</p>

      <button className={styles.restartBtn} onClick={onRestart}>
        {'[PLAY AGAIN ▶]'}
      </button>
    </div>
  );
}
