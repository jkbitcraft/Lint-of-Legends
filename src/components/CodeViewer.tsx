'use client';

import type { LineState } from '../types';
import styles from './CodeViewer.module.css';

interface Props {
  code: string;
  selectedLines: Set<number>;
  lineStates: Record<number, LineState>;
  submitted: boolean;
  onToggleLine: (line: number) => void;
}

const LINE_NUM_COLOR: Record<LineState, string> = {
  idle:           'var(--linenum)',
  selected:       'var(--brand)',
  correct:        'var(--success)',
  missed:         'var(--error)',
  false_positive: 'var(--error)',
  revealed:       'var(--brand)',
};

const LINE_BG: Record<LineState, string> = {
  idle:           'transparent',
  selected:       'var(--sel-bg)',
  correct:        'var(--ok-bg)',
  missed:         'var(--err-bg)',
  false_positive: 'var(--err-bg)',
  revealed:       'var(--sel-bg)',
};

const LEFT_BORDER: Record<LineState, string> = {
  idle:           'transparent',
  selected:       'var(--brand)',
  correct:        'var(--success)',
  missed:         'var(--error)',
  false_positive: 'var(--error)',
  revealed:       'var(--brand)',
};

const INDICATOR: Partial<Record<LineState, string>> = {
  correct:        '✓',
  missed:         '✗',
  false_positive: '✗',
  revealed:       '→',
};

export default function CodeViewer({ code, selectedLines, lineStates, submitted, onToggleLine }: Props) {
  const lines = code.split('\n');

  return (
    <div className={styles.codeBlock}>
      {lines.map((line, idx) => {
        const lineNum = idx + 1;
        const state: LineState = submitted
          ? (lineStates[lineNum] ?? 'idle')
          : selectedLines.has(lineNum) ? 'selected' : 'idle';
        const indicator = submitted ? INDICATOR[state] : undefined;

        return (
          <div
            key={lineNum}
            className={styles.line}
            style={{
              backgroundColor: LINE_BG[state],
              borderLeftColor: LEFT_BORDER[state],
            }}
            onClick={() => !submitted && onToggleLine(lineNum)}
            role={submitted ? undefined : 'option'}
            aria-selected={selectedLines.has(lineNum)}
            tabIndex={submitted ? -1 : 0}
            onKeyDown={(e) => {
              if (!submitted && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onToggleLine(lineNum);
              }
            }}
          >
            <span className={styles.lineNum} style={{ color: LINE_NUM_COLOR[state] }}>
              {indicator ?? String(lineNum).padStart(2, ' ')}
            </span>
            <span className={styles.lineCode}>{line || ' '}</span>
          </div>
        );
      })}
    </div>
  );
}
