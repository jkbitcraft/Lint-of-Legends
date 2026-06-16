import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Language, Difficulty, Question, GradeResult } from '../src/types';
import { getRandomQuestion } from '../src/utils/questions';
import { grade, reveal } from '../src/utils/grader';
import { useSettings } from '../src/context/SettingsContext';
import CodeViewer from '../src/components/CodeViewer';
import ResultView from '../src/components/ResultView';
import { C, MONO } from '../src/theme';

export default function QuizScreen() {
  const params = useLocalSearchParams<{ language: string; difficulty: string }>();
  const language = (params.language ?? 'python') as Language;
  const difficulty = (params.difficulty ?? 'beginner') as Difficulty;
  const isBeginner = difficulty === 'beginner';

  const { settings } = useSettings();
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<GradeResult | null>(null);

  const loadNext = useCallback(
    (excludeId?: string) => {
      const q = getRandomQuestion(language, difficulty, excludeId);
      setQuestion(q);
      setSelectedLines(new Set());
      setResult(null);
    },
    [language, difficulty],
  );

  useEffect(() => {
    loadNext();
  }, [loadNext]);

  function toggleLine(line: number) {
    if (result) return;
    setSelectedLines((prev) => {
      const next = new Set(prev);
      if (next.has(line)) next.delete(line);
      else next.add(line);
      return next;
    });
  }

  function handleSubmit() {
    if (!question) return;
    if (selectedLines.size === 0) {
      Alert.alert(
        'Nothing selected',
        'Tap a line you think contains a bug, or press NO BUGS HERE.',
      );
      return;
    }
    setResult(grade(question, Array.from(selectedLines), false));
  }

  function handleNoBugs() {
    if (!question) return;
    setResult(grade(question, [], true));
  }

  function handleGiveUp() {
    if (!question) return;
    Alert.alert('Reveal answer?', 'This will mark the question as failed.', [
      { text: 'Keep trying', style: 'cancel' },
      { text: 'Reveal', style: 'destructive', onPress: () => setResult(reveal(question)) },
    ]);
  }

  if (!question) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <View style={s.center}>
          <Text style={s.emptyMsg}>{'> NO QUESTIONS LOADED'}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.backLink}>{'< BACK'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const langLabel =
    language === 'python' ? 'PY' : language === 'javascript' ? 'JS' : 'HTML';
  const diffLabel = difficulty.toUpperCase().slice(0, 3);
  const hasSelection = selectedLines.size > 0;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={s.backBtn}>{'< EXIT'}</Text>
        </TouchableOpacity>
        <Text style={s.metaText}>{`[${langLabel}/${diffLabel}]`}</Text>
        {/* SCORING_PLACEHOLDER: session score display here */}
      </View>

      {!result ? (
        <>
          <Text style={s.instruction}>{'> tap lines containing a bug'}</Text>
          <View style={s.codeArea}>
            <CodeViewer
              code={question.code}
              selectedLines={selectedLines}
              lineStates={{}}
              submitted={false}
              onToggleLine={toggleLine}
            />
          </View>
          <View style={s.actions}>
            <TouchableOpacity style={s.btnNoBugs} onPress={handleNoBugs} activeOpacity={0.8}>
              <Text style={s.btnNoBugsText}>NO BUGS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnGiveUp} onPress={handleGiveUp} activeOpacity={0.8}>
              <Text style={s.btnGiveUpText}>GIVE UP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnSubmit, !hasSelection && s.btnSubmitDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={[s.btnSubmitText, !hasSelection && s.btnSubmitTextDisabled]}>
                SUBMIT
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={[s.codeAreaSmall, { opacity: 0.5 }]}>
            <CodeViewer
              code={question.code}
              selectedLines={selectedLines}
              lineStates={result.lineStates}
              submitted={true}
              onToggleLine={() => {}}
            />
          </View>
          <ResultView
            result={result}
            question={question}
            showBugCount={isBeginner && settings.showBugCount}
            onNext={() => loadNext(question.id)}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  backBtn: {
    fontFamily: MONO,
    color: C.brand,
    fontSize: 12,
    letterSpacing: 1,
  },
  metaText: {
    fontFamily: MONO,
    color: C.muted,
    fontSize: 11,
    letterSpacing: 1,
  },
  instruction: {
    fontFamily: MONO,
    color: C.muted,
    fontSize: 11,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSubtle,
  },
  codeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  codeAreaSmall: {
    flex: 2,
    backgroundColor: C.bg,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface,
  },
  btnNoBugs: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: 'transparent',
  },
  btnNoBugsText: {
    fontFamily: MONO,
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  btnGiveUp: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#440000',
    backgroundColor: 'transparent',
  },
  btnGiveUpText: {
    fontFamily: MONO,
    color: '#993333',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  btnSubmit: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.brand,
    backgroundColor: C.selectedBg,
  },
  btnSubmitDisabled: {
    borderColor: '#333',
    backgroundColor: 'transparent',
  },
  btnSubmitText: {
    fontFamily: MONO,
    color: C.brand,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  btnSubmitTextDisabled: {
    color: '#444',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyMsg: {
    fontFamily: MONO,
    color: C.muted,
    fontSize: 14,
    marginBottom: 16,
  },
  backLink: {
    fontFamily: MONO,
    color: C.brand,
    fontSize: 14,
  },
});
