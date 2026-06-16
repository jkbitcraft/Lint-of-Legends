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

export default function HomePage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('python');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [selectedSet, setSelectedSet] = useState<number | null>(null);
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

  function toggleSet(n: number) {
    setSelectedSet(prev => (prev === n ? null : n));
  }

  function handleStart() {
    const params = new URLSearchParams({ lang, diff: difficulty });
    if (endlessMode) params.set('mode', 'endless');
    if (selectedSet !== null) params.set('set', String(selectedSet));
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

          <p className={styles.sectionLabel}>SET: <span className={styles.setHint}>(optional — draws from that set within selected language/difficulty)</span></p>
          <div className={styles.setRow}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => toggleSet(n)}
                className={[styles.setBtn, selectedSet === n ? styles.setBtnActive : ''].join(' ')}
              >
                {n}
              </button>
            ))}
          </div>

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
