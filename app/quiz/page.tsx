'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Language, Difficulty, Question, GradeResult } from '@/src/types';
import { getRandomQuestion } from '@/src/utils/questions';
import { grade, reveal } from '@/src/utils/grader';
import CodeViewer from '@/src/components/CodeViewer';
import ResultPanel from '@/src/components/ResultPanel';
import styles from './quiz.module.css';

function QuizInner() {
  const router = useRouter();
  const params = useSearchParams();
  const lang = (params.get('lang') ?? 'python') as Language;
  const diff = (params.get('diff') ?? 'beginner') as Difficulty;

  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<GradeResult | null>(null);
  const [showBugCount, setShowBugCount] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('lol_show_bug_count');
    if (stored !== null) setShowBugCount(stored === 'true');
  }, []);

  const loadNext = useCallback((excludeId?: string) => {
    const q = getRandomQuestion(lang, diff, excludeId);
    setQuestion(q);
    setSelected(new Set());
    setResult(null);
  }, [lang, diff]);

  useEffect(() => { loadNext(); }, [loadNext]);

  function toggleLine(line: number) {
    if (result) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(line)) next.delete(line); else next.add(line);
      return next;
    });
  }

  function handleSubmit() {
    if (!question || selected.size === 0) return;
    setResult(grade(question, Array.from(selected), false));
  }

  function handleNoBugs() {
    if (!question) return;
    setResult(grade(question, [], true));
  }

  function handleGiveUp() {
    if (!question || !window.confirm('Reveal the answer? This will count as a miss.')) return;
    setResult(reveal(question));
  }

  if (!question) {
    return (
      <div className={styles.center}>
        <p className={styles.empty}>{`> NO QUESTIONS LOADED`}</p>
        <button className={styles.backLink} onClick={() => router.push('/')}>{'< BACK'}</button>
      </div>
    );
  }

  const langLabel = lang === 'python' ? 'PY' : lang === 'javascript' ? 'JS' : 'HTML';

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/')}>{'< EXIT'}</button>
        <span className={styles.meta}>{`[${langLabel}/${diff.toUpperCase().slice(0, 3)}]`}</span>
      </header>

      <div className={[styles.codeWrap, result ? styles.codeWrapDimmed : ''].join(' ')}>
        <p className={styles.instruction}>
          {result ? '// result' : '> select lines containing bugs'}
        </p>
        <CodeViewer
          code={question.code}
          selectedLines={selected}
          lineStates={result?.lineStates ?? {}}
          submitted={!!result}
          onToggleLine={toggleLine}
        />
      </div>

      {result ? (
        <ResultPanel
          result={result}
          question={question}
          showBugCount={diff === 'beginner' && showBugCount}
          onNext={() => loadNext(question.id)}
        />
      ) : (
        <div className={styles.actions}>
          <button className={styles.btnNoBugs} onClick={handleNoBugs}>[NO BUGS]</button>
          <button className={styles.btnGiveUp} onClick={handleGiveUp}>[GIVE UP]</button>
          <button
            className={[styles.btnSubmit, selected.size === 0 ? styles.btnSubmitDisabled : ''].join(' ')}
            onClick={handleSubmit}
            disabled={selected.size === 0}
          >
            [SUBMIT ▶]
          </button>
        </div>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense>
      <QuizInner />
    </Suspense>
  );
}
