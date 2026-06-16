import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Language, Difficulty, Question, GradeResult } from '../src/types';
import { getRandomQuestion } from '../src/utils/questions';
import { grade, reveal } from '../src/utils/grader';
import { useSettings } from '../src/context/SettingsContext';
import CodeViewer from '../src/components/CodeViewer';
import ResultView from '../src/components/ResultView';

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
        'Tap lines you think contain a bug, or press "No Bugs Here".',
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
    Alert.alert('Give up?', 'This will reveal the answer.', [
      { text: 'Keep trying', style: 'cancel' },
      { text: 'Reveal', style: 'destructive', onPress: () => setResult(reveal(question)) },
    ]);
  }

  if (!question) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyMsg}>No questions available yet.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const langLabel =
    language === 'python' ? 'Python' : language === 'javascript' ? 'JS' : 'HTML/CSS';
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.metaText}>
          {langLabel} · {diffLabel}
        </Text>
      </View>

      {!result ? (
        // ── Pre-submission ───────────────────────────────────────────
        <>
          <Text style={styles.instruction}>Tap lines you think contain a bug</Text>
          <View style={styles.codeArea}>
            <CodeViewer
              code={question.code}
              selectedLines={selectedLines}
              lineStates={{}}
              submitted={false}
              onToggleLine={toggleLine}
            />
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnNoBugs} onPress={handleNoBugs}>
              <Text style={styles.btnNoBugsText}>No Bugs Here</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnGiveUp} onPress={handleGiveUp}>
              <Text style={styles.btnGiveUpText}>Give Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit}>
              <Text style={styles.btnSubmitText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // ── Post-submission ──────────────────────────────────────────
        <>
          <View style={styles.codeAreaSmall}>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: { color: '#3B82F6', fontSize: 16 },
  metaText: { color: '#475569', fontSize: 13 },
  instruction: {
    color: '#64748B',
    fontSize: 12,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  codeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  codeAreaSmall: {
    flex: 2,
    backgroundColor: '#111827',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  btnNoBugs: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  btnNoBugsText: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  btnGiveUp: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7C2D12',
  },
  btnGiveUpText: { color: '#FB923C', fontWeight: '600', fontSize: 13 },
  btnSubmit: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSubmitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyMsg: { color: '#64748B', fontSize: 16, marginBottom: 16 },
  backLink: { color: '#3B82F6', fontSize: 16 },
});
