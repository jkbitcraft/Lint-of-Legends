'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Language, Difficulty, GradeResult } from '@/src/types';
import { getSessionQuestions, getSetQuestions } from '@/src/utils/questions';
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
  const mode = params.get('mode') ?? 'session';
  const setParam = params.get('set');
  const setNum = setParam ? parseInt(setParam, 10) : null;
  const isIntermediate = diff === 'intermediate';
  const isEndless = mode === 'endless';

  const [questions, setQuestions] = useState(() =>
    setNum !== null
      ? getSetQuestions(lang, diff, setNum, isEndless ? 50 : SESSION_SIZE)
      : isEndless
      ? getSessionQuestions(lang, diff, 50)
      : getSessionQuestions(lang, diff, SESSION_SIZE)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<(GradeResult | null)[]>(() =>
    Array(isEndless ? 50 : SESSION_SIZE).fill(null)
  );
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [showBugCount, setShowBugCount] = useState(true);
  const [sessionDone, setSessionDone] = useState(false);
  const [endlessGameOver, setEndlessGameOver] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('lol_show_bug_count');
    if (stored !== null) setShowBugCount(stored === 'true');
  }, []);

  const totalQuestions = isEndless ? questions.length : SESSION_SIZE;
  const question = questions[currentIndex] ?? null;
  const currentResult = results[currentIndex] ?? null;

  function restartSession() {
    const newQs = setNum !== null
      ? getSetQuestions(lang, diff, setNum, isEndless ? 50 : SESSION_SIZE)
      : isEndless
      ? getSessionQuestions(lang, diff, 50)
      : getSessionQuestions(lang, diff, SESSION_SIZE);
    setQuestions(newQs);
    setCurrentIndex(0);
    setResults(Array(isEndless ? 50 : SESSION_SIZE).fill(null));
    setSelected(new Set());
    setEdits({});
    setSessionDone(false);
    setEndlessGameOver(false);
    setStreak(0);
  }

  function advanceOrFinish(result: GradeResult) {
    const newResults = [...results];
    newResults[currentIndex] = result;
    setResults(newResults);

    if (isEndless) {
      if (!result.passed && !result.usedGiveUp) {
        setEndlessGameOver(true);
      } else {
        if (result.passed) setStreak(s => s + 1);
      }
      return;
    }

    const isLast = currentIndex === SESSION_SIZE - 1;
    if (isLast) {
      setSessionDone(true);
    }
  }

  function handleNext() {
    if (isEndless) {
      if (endlessGameOver) return;
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setSelected(new Set());
        setEdits({});
      } else {
        // Exhausted all questions — reshuffle and continue
        const newQs = getSessionQuestions(lang, diff, 50);
        setQuestions(newQs);
        setResults(Array(50).fill(null));
        setCurrentIndex(0);
        setSelected(new Set());
        setEdits({});
      }
      return;
    }
    if (currentIndex < SESSION_SIZE - 1) {
      setCurrentIndex(i => i + 1);
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
  const modeLabel = isEndless ? 'ENDLESS' : setNum !== null ? `SET ${setNum}` : diff.toUpperCase().slice(0, 3);
  const canSubmit = isIntermediate ? Object.keys(edits).length > 0 : selected.size > 0;

  if (!question) {
    return (
      <div className={styles.center}>
        <p className={styles.empty}>{`> NO QUESTIONS LOADED`}</p>
        <button className={styles.backLink} onClick={() => router.push('/')}>{'< BACK'}</button>
      </div>
    );
  }

  // Endless game over screen
  if (isEndless && endlessGameOver) {
    return (
      <div className={styles.layout}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.push('/')}>{'< EXIT'}</button>
          <span className={styles.meta}>{`[${langLabel}/ENDLESS]`}</span>
        </header>
        <div className={styles.gameOverWrap}>
          <p className={styles.gameOverTitle}>GAME OVER</p>
          <p className={styles.gameOverStreak}>{`STREAK: ${streak}`}</p>
          <p className={styles.gameOverSub}>{streak >= 10 ? 'IMPRESSIVE' : streak >= 5 ? 'SOLID RUN' : 'KEEP PRACTICING'}</p>
          <button className={styles.restartBtn} onClick={restartSession}>{'[TRY AGAIN ▶]'}</button>
          <button className={styles.exitBtn} onClick={() => router.push('/')}>{'[EXIT]'}</button>
        </div>
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div className={styles.layout}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.push('/')}>{'< EXIT'}</button>
          <span className={styles.meta}>{`[${langLabel}/${modeLabel}]`}</span>
        </header>
        <ResultsScreen results={results} onRestart={restartSession} />
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/')}>{'< EXIT'}</button>
        <span className={styles.meta}>{`[${langLabel}/${modeLabel}]`}</span>
      </header>

      {isEndless ? (
        <div className={styles.streakBar}>
          <span className={styles.streakLabel}>STREAK</span>
          <span className={styles.streakCount}>{streak}</span>
        </div>
      ) : (
        <ScoreBar
          currentIndex={currentIndex}
          total={SESSION_SIZE}
          results={results}
        />
      )}

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
          showBugCount={!isIntermediate && showBugCount}
          isIntermediate={isIntermediate}
          onNext={handleNext}
          nextLabel={isEndless && endlessGameOver ? undefined : '[NEXT QUESTION ▶]'}
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
