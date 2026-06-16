import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { GradeResult, Question } from '../types';

interface Props {
  result: GradeResult;
  question: Question;
  showBugCount: boolean;
  onNext: () => void;
}

export default function ResultView({ result, question, showBugCount, onNext }: Props) {
  const { passed, usedGiveUp, lineStates } = result;
  const hasBugs = question.bugs.length > 0;

  const missedCount = Object.values(lineStates).filter((s) => s === 'missed').length;
  const fpCount = Object.values(lineStates).filter((s) => s === 'false_positive').length;

  let headline = '';
  let headlineColor = '#4ADE80';

  if (usedGiveUp) {
    headline = 'Answer revealed';
    headlineColor = '#FB923C';
  } else if (passed) {
    headline = hasBugs ? '✓  All bugs found.' : '✓  Correct — no bugs.';
  } else {
    headlineColor = '#F87171';
    if (!hasBugs) {
      headline = '✗  This snippet had no bugs.';
    } else if (missedCount > 0 && fpCount > 0) {
      headline = `✗  Missed ${missedCount} bug${missedCount > 1 ? 's' : ''}, flagged ${fpCount} clean line${fpCount > 1 ? 's' : ''}.`;
    } else if (missedCount > 0) {
      headline = `✗  Missed ${missedCount} bug${missedCount > 1 ? 's' : ''}.`;
    } else {
      headline = `✗  Flagged ${fpCount} clean line${fpCount > 1 ? 's' : ''}.`;
    }
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.headline, { color: headlineColor }]}>{headline}</Text>

      {showBugCount && !usedGiveUp && (
        <Text style={styles.bugCountHint}>
          {hasBugs
            ? `This snippet had ${question.bugs.length} bug${question.bugs.length > 1 ? 's' : ''}.`
            : 'This snippet had no bugs.'}
        </Text>
      )}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {question.bugs.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No bugs</Text>
            <Text style={styles.explanation}>
              This was a clean snippet. Recognizing correct code is part of the challenge.
            </Text>
          </View>
        ) : (
          question.bugs.map((bug, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>
                {question.bugs.length > 1 ? `Bug ${i + 1}  ·  ` : ''}
                Line{bug.lines.length > 1 ? 's' : ''} {bug.lines.join(', ')}
              </Text>
              <Text style={styles.explanation}>{bug.explanation}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
        <Text style={styles.nextText}>Next Question →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    padding: 14,
    flex: 1,
  },
  headline: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  bugCountHint: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 10,
  },
  scroll: { flex: 1 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  explanation: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 21,
  },
  nextBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 13,
    alignItems: 'center',
    marginTop: 10,
  },
  nextText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
