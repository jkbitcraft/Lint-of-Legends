'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Language, Difficulty, GradeResult } from '@/src/types';
import { getSessionQuestions } from '@/src/utils/questions';
import { grade, gradeEdits, reveal } from '@/src/utils/grader';
import CodeViewer from '@/src/components/CodeViewer';
import CodeEditor from '@/src/components/CodeEditor';
import ResultPanel from '@/src/components/ResultPanel';
import ScoreBar from '@/src/components/ScoreBar';
import ResultsScreen from '@/src/components/ResultsScreen';
import styles from './quiz.module.css';

const SESSION_SIZE = 10;

function QuizInner() {
  const router = useRouter();
  const params = useSearchParams();
  const lang = (params.get('lang') ?? 'python') as Language;
  const diff = (params.get('diff') ?? 'beginner') as Difficulty;
  const isIntermediate = diff === 'intermediate';

  const [questions, setQuestions] = useState(() => getSessionQuestions(lang, diff, SESSION_SIZE));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<(GradeResult | null)[]>(() => Array(SESSION_SIZE).fill(null));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [showBugCount, setShowBugCount] = useState(true);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lol_show_bug_count');
    if (stored !== null) setShowBugCount(stored === 'true');
  }, []);

  const question = questions[currentIndex] ?? null;
  const currentResult = results[currentIndex] ?? null;

  function restartSession() {
    setQuestions(getSessionQuestions(lang, diff, SESSION_SIZE));
    setCurrentIndex(0);
    setResults(Array(SESSION_SIZE).fill(null));
    setSelected(new Set());
    setEdits({});
    setSessionDone(false);
  }

  function advanceOrFinish(result: GradeResult) {
    const newResults = [...results];
    newResults[currentIndex] = result;
    setResults(newResults);

    const isLast = currentIndex === SESSION_SIZE - 1;
    if (isLast) {
      setSessionDone(true);
    }
  }

  function handleNext() {
    if (currentIndex < SESSION_SIZE - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(new Set());
      setEdits({});
    } else {
      setSessionDone(true);
    }
  }

  function toggleLine(line: number) {
    if (currentResult) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(line)) next.delete(line); else next.add(line);
      return next;
    });
  }

  function editLine(line: number, value: string) {
    if (currentResult) return;
    setEdits((prev) => ({ ...prev, [line]: value }));
  }

  function handleSubmit() {
    if (!question) return;
    let result: GradeResult;
    if (isIntermediate) {
      if (Object.keys(edits).length === 0) return;
      result = gradeEdits(question, edits, false);
    } else {
      if (selected.size === 0) return;
      result = grade(question, Array.from(selected), false);
    }
    advanceOrFinish(result);
  }

  function handleNoBugs() {
    if (!question) return;
    const result = isIntermediate
      ? gradeEdits(question, {}, true)
      : grade(question, [], true);
    advanceOrFinish(result);
  }

  function handleGiveUp() {
    if (!question || !window.confirm('Reveal the answer? This will count as a miss.')) return;
    advanceOrFinish(reveal(question));
  }

  const langLabel = lang === 'python' ? 'PY' : lang === 'javascript' ? 'JS' : 'HTML';
  const canSubmit = isIntermediate ? Object.keys(edits).length > 0 : selected.size > 0;

  if (!question) {
    return (
      <div className={styles.center}>
        <p className={styles.empty}>{`> NO QUESTIONS LOADED`}</p>
        <button className={styles.backLink} onClick={() => router.push('/')}>{'< BACK'}</button>
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div className={styles.layout}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.push('/')}>{'< EXIT'}</button>
          <span className={styles.meta}>{`[${langLabel}/${diff.toUpperCase().slice(0, 3)}]`}</span>
        </header>
        <ResultsScreen results={results} onRestart={restartSession} />
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/')}>{'< EXIT'}</button>
        <span className={styles.meta}>{`[${langLabel}/${diff.toUpperCase().slice(0, 3)}]`}</span>
      </header>

      <ScoreBar currentIndex={currentIndex} total={SESSION_SIZE} results={results} />

      <div className={[styles.codeWrap, currentResult ? styles.codeWrapDimmed : ''].join(' ')}>
        <p className={styles.instruction}>
          {currentResult
            ? '// result'
            : isIntermediate
            ? '> hover a line and click edit to fix the bug'
            : '> select lines containing bugs'}
        </p>

        {isIntermediate ? (
          <CodeEditor
            code={question.code}
            edits={edits}
            lineStates={currentResult?.lineStates ?? {}}
            submitted={!!currentResult}
            onEditLine={editLine}
          />
        ) : (
          <CodeViewer
            code={question.code}
            selectedLines={selected}
            lineStates={currentResult?.lineStates ?? {}}
            submitted={!!currentResult}
            onToggleLine={toggleLine}
          />
        )}
      </div>

      {currentResult ? (
        <ResultPanel
          result={currentResult}
          question={question}
          showBugCount={diff === 'beginner' && showBugCount}
          onNext={handleNext}
        />
      ) : (
        <div className={styles.actions}>
          <button className={styles.btnNoBugs} onClick={handleNoBugs}>[NO BUGS]</button>
          <button className={styles.btnGiveUp} onClick={handleGiveUp}>[GIVE UP]</button>
          <button
            className={[styles.btnSubmit, !canSubmit ? styles.btnSubmitDisabled : ''].join(' ')}
            onClick={handleSubmit}
            disabled={!canSubmit}
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
