import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { GradeResult, Question } from '../types';
import { C, MONO, DIVIDER } from '../theme';

interface Props {
  result: GradeResult;
  question: Question;
  showBugCount: boolean;
  onNext: () => void;
}

type Verdict = 'correct' | 'incorrect' | 'revealed';

function getVerdict(result: GradeResult, question: Question): {
  verdict: Verdict;
  statusLine: string;
  detailLine: string;
  color: string;
  borderColor: string;
} {
  const { passed, usedGiveUp, lineStates } = result;
  const hasBugs = question.bugs.length > 0;

  if (usedGiveUp) {
    const bugLines = question.bugs.flatMap((b) => b.lines);
    return {
      verdict: 'revealed',
      statusLine: 'ANSWER REVEALED',
      detailLine: bugLines.length > 0 ? `LINE: ${bugLines.join(', ')}` : 'NO BUGS PRESENT',
      color: C.brand,
      borderColor: C.brand,
    };
  }

  if (passed) {
    const statusLine = 'STATUS: CORRECT';
    if (!hasBugs) {
      return { verdict: 'correct', statusLine, detailLine: 'NO BUGS PRESENT', color: C.success, borderColor: C.success };
    }
    const bugLines = question.bugs.flatMap((b) => b.lines);
    return { verdict: 'correct', statusLine, detailLine: `LINE: ${bugLines.join(', ')}`, color: C.success, borderColor: C.success };
  }

  // incorrect
  const missedLines = Object.entries(lineStates)
    .filter(([, s]) => s === 'missed')
    .map(([n]) => n);
  const fpLines = Object.entries(lineStates)
    .filter(([, s]) => s === 'false_positive')
    .map(([n]) => n);

  let detailLine = '';
  if (!hasBugs) {
    detailLine = `YOUR SELECTION: line${fpLines.length > 1 ? 's' : ''} ${fpLines.join(', ')}`;
  } else if (missedLines.length > 0) {
    detailLine = `ACTUAL BUG: line${missedLines.length > 1 ? 's' : ''} ${missedLines.join(', ')}`;
  } else if (fpLines.length > 0) {
    detailLine = `FALSE POSITIVE: line${fpLines.length > 1 ? 's' : ''} ${fpLines.join(', ')}`;
  }

  return {
    verdict: 'incorrect',
    statusLine: 'STATUS: INCORRECT',
    detailLine,
    color: C.error,
    borderColor: C.error,
  };
}

export default function ResultView({ result, question, showBugCount, onNext }: Props) {
  const { statusLine, detailLine, color, borderColor } = getVerdict(result, question);
  const hasBugs = question.bugs.length > 0;

  return (
    <View style={[s.container, { borderLeftColor: borderColor }]}>
      <Text style={[s.divider, { color: C.border }]}>{DIVIDER}</Text>
      <Text style={[s.statusLine, { color }]}>{statusLine}</Text>
      {detailLine ? <Text style={s.detailLine}>{detailLine}</Text> : null}

      {showBugCount && !result.usedGiveUp && (
        <Text style={s.bugCount}>
          {hasBugs
            ? `BUG COUNT: ${question.bugs.length}`
            : 'BUG COUNT: 0'}
        </Text>
      )}

      <Text style={[s.divider, { color: C.border }]}>{DIVIDER}</Text>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {question.bugs.length === 0 ? (
          <Text style={s.explanation}>
            This was a clean snippet. Recognizing correct code is part of the challenge.
          </Text>
        ) : (
          question.bugs.map((bug, i) => (
            <View key={i} style={s.bugBlock}>
              {question.bugs.length > 1 && (
                <Text style={[s.bugLabel, { color: C.muted }]}>
                  {`BUG ${i + 1}  ·  LINE${bug.lines.length > 1 ? 'S' : ''} ${bug.lines.join(', ')}`}
                </Text>
              )}
              <Text style={s.explanation}>{bug.explanation}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Text style={[s.divider, { color: C.border }]}>{DIVIDER}</Text>

      <TouchableOpacity style={s.nextBtn} onPress={onNext} activeOpacity={0.8}>
        <Text style={s.nextText}>{'> NEXT QUESTION'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    borderLeftWidth: 4,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flex: 1,
  },
  divider: {
    fontFamily: MONO,
    fontSize: 12,
    marginVertical: 8,
  },
  statusLine: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  detailLine: {
    fontFamily: MONO,
    fontSize: 12,
    color: C.muted,
    marginBottom: 2,
  },
  bugCount: {
    fontFamily: MONO,
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  bugBlock: {
    marginBottom: 10,
  },
  bugLabel: {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 4,
  },
  explanation: {
    fontFamily: MONO,
    fontSize: 13,
    color: '#aaaaaa',
    lineHeight: 20,
  },
  nextBtn: {
    backgroundColor: C.selectedBg,
    borderWidth: 1,
    borderColor: C.brand,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  nextText: {
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: '700',
    color: C.brand,
    letterSpacing: 1.5,
  },
});
