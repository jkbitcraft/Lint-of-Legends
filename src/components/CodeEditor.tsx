'use client';

import { useRef } from 'react';
import type { LineState } from '../types';
import styles from './CodeEditor.module.css';

interface Props {
  code: string;
  edits: Record<number, string>;
  lineStates: Record<number, LineState>;
  submitted: boolean;
  onEditLine: (line: number, value: string) => void;
}

const LINE_BG: Record<LineState, string> = {
  idle:           'transparent',
  selected:       'var(--sel-bg)',
  correct:        'var(--ok-bg)',
  missed:         'var(--err-bg)',
  false_positive: 'var(--err-bg)',
  revealed:       'var(--sel-bg)',
};

const LINE_BORDER: Record<LineState, string> = {
  idle:           'transparent',
  selected:       'var(--brand)',
  correct:        'var(--success)',
  missed:         'var(--error)',
  false_positive: 'var(--error)',
  revealed:       'var(--brand)',
};

const INDICATOR: Partial<Record<LineState, string>> = {
  correct: '✓',
  missed: '✗',
  false_positive: '✗',
  revealed: '→',
};

export default function CodeEditor({
  code, edits, lineStates, submitted, onEditLine,
}: Props) {
  const lines = code.split('\n');
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  return (
    <div className={styles.codeBlock}>
      {lines.map((line, idx) => {
        const lineNum = idx + 1;
        const state: LineState = lineStates[lineNum] ?? 'idle';
        const isEdited = lineNum in edits;
        const indicator = submitted ? INDICATOR[state] : undefined;
        const displayValue = isEdited ? edits[lineNum] : line;

        // Detect leading whitespace to preserve indentation hint
        const indent = line.match(/^(\s*)/)?.[1] ?? '';

        return (
          <div
            key={lineNum}
            className={styles.line}
            style={{
              backgroundColor: LINE_BG[state],
              borderLeftColor: LINE_BORDER[state],
            }}
          >
            <span
              className={styles.lineNum}
              style={{
                color: isEdited || state !== 'idle' ? 'var(--brand)' : 'var(--linenum)',
              }}
            >
              {indicator ?? String(lineNum).padStart(2, ' ')}
            </span>
            {submitted || !isEdited ? (
              <span className={styles.lineCode}>{displayValue || ' '}</span>
            ) : (
              <input
                ref={(el) => { inputRefs.current[lineNum] = el; }}
                className={styles.lineInput}
                value={displayValue}
                onChange={(e) => onEditLine(lineNum, e.target.value)}
                spellCheck={false}
                autoComplete="off"
                style={{ paddingLeft: `${indent.length * 7}px` }}
              />
            )}
            {!submitted && !isEdited && (
              <button
                className={styles.editBtn}
                onClick={() => {
                  onEditLine(lineNum, line);
                  setTimeout(() => inputRefs.current[lineNum]?.focus(), 0);
                }}
                tabIndex={0}
                aria-label={`Edit line ${lineNum}`}
              >
                edit
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
