'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Language, Difficulty } from '@/src/types';
import styles from './page.module.css';

const LANGUAGES: { label: string; value: Language; enabled: boolean }[] = [
  { label: 'PYTHON', value: 'python', enabled: true },
  { label: 'JAVASCRIPT', value: 'javascript', enabled: true },
  { label: 'HTML/CSS', value: 'html_css', enabled: true },
];

const DIFFICULTIES: { label: string; value: Difficulty; enabled: boolean }[] = [
  { label: 'BEGINNER', value: 'beginner', enabled: true },
  { label: 'INTERMEDIATE', value: 'intermediate', enabled: true },
];

const BANK_NAMES: Record<number, string> = {
  1: 'Python: Strings',
  2: 'Python: Lists & Loops',
  3: 'Python: Dicts & Sets',
  4: 'Python: Functions',
  5: 'Python: OOP',
  6: 'JS: Basics',
  7: 'JS: Functions & Arrays',
  8: 'JS: Modern JS',
  9: 'HTML: Markup & Forms',
  10: 'CSS: Layout',
};

export default function HomePage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('python');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [showBugCount, setShowBugCount] = useState(true);
  const [endlessMode, setEndlessMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lol_show_bug_count');
    if (stored !== null) setShowBugCount(stored === 'true');
    const storedEndless = localStorage.getItem('lol_endless_mode');
    if (storedEndless !== null) setEndlessMode(storedEndless === 'true');
  }, []);

  function toggleBugCount() {
    const next = !showBugCount;
    setShowBugCount(next);
    localStorage.setItem('lol_show_bug_count', String(next));
  }

  function toggleEndless() {
    const next = !endlessMode;
    setEndlessMode(next);
    localStorage.setItem('lol_endless_mode', String(next));
  }

  function toggleBank(n: number) {
    setSelectedBank(prev => (prev === n ? null : n));
  }

  function handleStart() {
    const params = new URLSearchParams({ lang, diff: difficulty });
    if (endlessMode) params.set('mode', 'endless');
    if (selectedBank !== null) params.set('bank', String(selectedBank));
    router.push(`/quiz?${params.toString()}`);
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>[LINT OF LEGENDS]</h1>
          <p className={styles.subtitle}>
            {'> SESSION READY'}
            <span className={styles.cursor} />
          </p>
        </header>

        <div className={styles.divider} />

        <section>
          <p className={styles.sectionLabel}>LANGUAGE:</p>
          <div className={styles.optionRow}>
            {LANGUAGES.map((item) => (
              <button
                key={item.value}
                disabled={!item.enabled}
                onClick={() => item.enabled && setLang(item.value)}
                className={[
                  styles.optionBtn,
                  lang === item.value && item.enabled ? styles.optionBtnActive : '',
                  !item.enabled ? styles.optionBtnDisabled : '',
                ].join(' ')}
              >
                {lang === item.value && item.enabled
                  ? `[${item.label} ✓]`
                  : `[${item.label}]`}
                {!item.enabled && <span className={styles.soon}> [SOON]</span>}
              </button>
            ))}
          </div>

          <p className={styles.sectionLabel}>DIFFICULTY:</p>
          <div className={styles.optionRow}>
            {DIFFICULTIES.map((item) => (
              <button
                key={item.value}
                disabled={!item.enabled}
                onClick={() => item.enabled && setDifficulty(item.value)}
                className={[
                  styles.optionBtn,
                  difficulty === item.value && item.enabled ? styles.optionBtnActive : '',
                  !item.enabled ? styles.optionBtnDisabled : '',
                ].join(' ')}
              >
                {difficulty === item.value && item.enabled
                  ? `[${item.label} ✓]`
                  : `[${item.label}]`}
                {!item.enabled && <span className={styles.soon}> [SOON]</span>}
              </button>
            ))}
          </div>

          <p className={styles.sectionLabel}>SET: <span className={styles.setHint}>(optional — overrides language/difficulty)</span></p>
          <div className={styles.setRow}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => toggleBank(n)}
                className={[styles.setBtn, selectedBank === n ? styles.setBtnActive : ''].join(' ')}
              >
                {n}
              </button>
            ))}
          </div>
          {selectedBank !== null && (
            <p className={styles.setLabel}>{`// ${BANK_NAMES[selectedBank]}`}</p>
          )}

          <div className={styles.divider} />

          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>ENDLESS MODE:</span>
            <button
              onClick={toggleEndless}
              className={[styles.toggleVal, endlessMode ? styles.toggleValOn : styles.toggleValOff].join(' ')}
            >
              {endlessMode ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>SHOW BUG COUNT AFTER SUBMIT:</span>
            <button
              onClick={toggleBugCount}
              className={[styles.toggleVal, showBugCount ? styles.toggleValOn : styles.toggleValOff].join(' ')}
            >
              {showBugCount ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className={styles.divider} />
        </section>

        <div className={styles.spacer} />

        <button className={styles.startBtn} onClick={handleStart}>
          {'[START SESSION]'}
        </button>
      </div>
    </main>
  );
}
