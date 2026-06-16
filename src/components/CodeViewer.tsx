import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LineState } from '../types';

interface Props {
  code: string;
  selectedLines: Set<number>;
  lineStates: Record<number, LineState>;
  submitted: boolean;
  onToggleLine: (line: number) => void;
}

const LINE_BG: Record<LineState, string> = {
  idle: 'transparent',
  selected: '#1D3557',
  correct: '#14532D',
  missed: '#450A0A',
  false_positive: '#450A0A',
  revealed: '#431407',
};

const INDICATOR: Partial<Record<LineState, { symbol: string; color: string }>> = {
  correct: { symbol: '✓', color: '#4ADE80' },
  missed: { symbol: '✗', color: '#F87171' },
  false_positive: { symbol: '✗', color: '#F87171' },
  revealed: { symbol: '→', color: '#FB923C' },
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
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.inner}>
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const state: LineState = submitted
            ? (lineStates[lineNum] ?? 'idle')
            : selectedLines.has(lineNum)
              ? 'selected'
              : 'idle';
          const indicator = submitted ? INDICATOR[state] : undefined;

          return (
            <TouchableOpacity
              key={lineNum}
              disabled={submitted}
              onPress={() => onToggleLine(lineNum)}
              style={[styles.line, { backgroundColor: LINE_BG[state] }]}
              activeOpacity={0.6}
            >
              <Text style={styles.lineNum}>{String(lineNum).padStart(2, ' ')}</Text>
              <Text style={styles.code}>{line || ' '}</Text>
              {indicator && (
                <Text style={[styles.indicator, { color: indicator.color }]}>
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

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { minWidth: '100%' },
  inner: { flex: 1 },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    minHeight: 30,
  },
  lineNum: {
    color: '#4B5563',
    fontFamily: 'monospace',
    fontSize: 13,
    width: 22,
    marginRight: 14,
    textAlign: 'right',
  },
  code: {
    color: '#D1D5DB',
    fontFamily: 'monospace',
    fontSize: 13,
    flex: 1,
  },
  indicator: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 10,
    width: 14,
  },
});
