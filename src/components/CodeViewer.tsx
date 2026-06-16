import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LineState } from '../types';
import { C, MONO } from '../theme';

interface Props {
  code: string;
  selectedLines: Set<number>;
  lineStates: Record<number, LineState>;
  submitted: boolean;
  onToggleLine: (line: number) => void;
}

const LINE_BG: Record<LineState, string> = {
  idle:          'transparent',
  selected:      C.selectedBg,
  correct:       C.correctBg,
  missed:        C.wrongBg,
  false_positive: C.wrongBg,
  revealed:      C.revealedBg,
};

const LEFT_BORDER_COLOR: Record<LineState, string> = {
  idle:           'transparent',
  selected:       C.brand,
  correct:        C.success,
  missed:         C.error,
  false_positive: C.error,
  revealed:       C.brand,
};

const INDICATOR: Partial<Record<LineState, { symbol: string; color: string }>> = {
  correct:        { symbol: '✓', color: C.success },
  missed:         { symbol: '✗', color: C.error },
  false_positive: { symbol: '✗', color: C.error },
  revealed:       { symbol: '→', color: C.brand },
};

export default function CodeViewer({
  code,
  selectedLines,
  lineStates,
  submitted,
  onToggleLine,
}: Props) {
  const lines = code.split('\n');

  return (
    <ScrollView
      horizontal
      style={s.scroll}
      contentContainerStyle={s.scrollContent}
      showsHorizontalScrollIndicator={false}
    >
      <View style={s.inner}>
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const state: LineState = submitted
            ? (lineStates[lineNum] ?? 'idle')
            : selectedLines.has(lineNum)
              ? 'selected'
              : 'idle';
          const indicator = submitted ? INDICATOR[state] : undefined;
          const borderColor = LEFT_BORDER_COLOR[state];

          return (
            <TouchableOpacity
              key={lineNum}
              disabled={submitted}
              onPress={() => onToggleLine(lineNum)}
              style={[
                s.line,
                {
                  backgroundColor: LINE_BG[state],
                  borderLeftColor: borderColor,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[s.lineNum, borderColor !== 'transparent' && { color: borderColor }]}>
                {String(lineNum).padStart(2, ' ')}
              </Text>
              <Text style={s.code}>{line || ' '}</Text>
              {indicator && (
                <Text style={[s.indicator, { color: indicator.color }]}>
                  {indicator.symbol}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.bg },
  scrollContent: { minWidth: '100%' },
  inner: { flex: 1 },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 28,
    paddingVertical: 0,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  lineNum: {
    fontFamily: MONO,
    fontSize: 13,
    color: C.lineNum,
    width: 40,
    textAlign: 'right',
    paddingRight: 10,
  },
  code: {
    fontFamily: MONO,
    fontSize: 13,
    color: C.text,
    flex: 1,
    paddingRight: 16,
  },
  indicator: {
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: '700',
    width: 16,
    marginRight: 8,
    textAlign: 'center',
  },
});
