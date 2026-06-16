import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Language, Difficulty } from '../src/types';
import { useSettings } from '../src/context/SettingsContext';
import { C, MONO } from '../src/theme';

const LANGUAGES: { label: string; value: Language; enabled: boolean }[] = [
  { label: 'PYTHON', value: 'python', enabled: true },
  { label: 'JAVASCRIPT', value: 'javascript', enabled: false },
  { label: 'HTML/CSS', value: 'html_css', enabled: false },
];

const DIFFICULTIES: { label: string; value: Difficulty; enabled: boolean }[] = [
  { label: 'BEGINNER', value: 'beginner', enabled: true },
  { label: 'INTERMEDIATE', value: 'intermediate', enabled: false },
];

export default function HomeScreen() {
  const [lang, setLang] = useState<Language>('python');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const { settings, toggleBugCount } = useSettings();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.container}>

        <View style={s.header}>
          <Text style={s.title}>LINT OF LEGENDS</Text>
          <Text style={s.subtitle}>{'> spot the bug. level up._'}</Text>
        </View>

        <View style={s.dividerLine} />

        <Text style={s.sectionLabel}>// LANGUAGE</Text>
        <View style={s.optionRow}>
          {LANGUAGES.map((item) => {
            const active = lang === item.value && item.enabled;
            return (
              <TouchableOpacity
                key={item.value}
                disabled={!item.enabled}
                onPress={() => setLang(item.value)}
                style={[s.optionBtn, active && s.optionBtnActive, !item.enabled && s.optionBtnDisabled]}
                activeOpacity={0.7}
              >
                <Text style={[s.optionText, active && s.optionTextActive, !item.enabled && s.optionTextDisabled]}>
                  {item.label}{!item.enabled ? ' [SOON]' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.sectionLabel}>// DIFFICULTY</Text>
        <View style={s.optionRow}>
          {DIFFICULTIES.map((item) => {
            const active = difficulty === item.value && item.enabled;
            return (
              <TouchableOpacity
                key={item.value}
                disabled={!item.enabled}
                onPress={() => setDifficulty(item.value)}
                style={[s.optionBtn, active && s.optionBtnActive, !item.enabled && s.optionBtnDisabled]}
                activeOpacity={0.7}
              >
                <Text style={[s.optionText, active && s.optionTextActive, !item.enabled && s.optionTextDisabled]}>
                  {item.label}{!item.enabled ? ' [SOON]' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.dividerLine} />

        <View style={s.toggleRow}>
          <Text style={s.toggleLabel}>SHOW BUG COUNT HINT</Text>
          <TouchableOpacity
            onPress={toggleBugCount}
            style={[s.toggleVal, settings.showBugCount ? s.toggleValOn : s.toggleValOff]}
          >
            <Text style={[s.toggleText, settings.showBugCount ? s.toggleTextOn : s.toggleTextOff]}>
              {settings.showBugCount ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={s.dividerLine} />

        <View style={s.spacer} />

        <TouchableOpacity
          style={s.startBtn}
          onPress={() => router.push({ pathname: '/quiz', params: { language: lang, difficulty } })}
          activeOpacity={0.8}
        >
          <Text style={s.startText}>{'> START SESSION'}</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontFamily: MONO,
    fontSize: 22,
    fontWeight: '700',
    color: C.brand,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: MONO,
    fontSize: 13,
    color: C.success,
    marginTop: 6,
  },
  dividerLine: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 16,
  },
  sectionLabel: {
    fontFamily: MONO,
    fontSize: 11,
    color: C.muted,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  optionBtnActive: {
    borderColor: C.brand,
    backgroundColor: C.selectedBg,
  },
  optionBtnDisabled: {
    opacity: 0.35,
  },
  optionText: {
    fontFamily: MONO,
    fontSize: 12,
    color: C.muted,
    letterSpacing: 1,
  },
  optionTextActive: {
    color: C.brand,
  },
  optionTextDisabled: {
    color: C.lineNum,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLabel: {
    fontFamily: MONO,
    fontSize: 11,
    color: C.muted,
    letterSpacing: 1,
  },
  toggleVal: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  toggleValOn: {
    borderColor: C.success,
    backgroundColor: C.correctBg,
  },
  toggleValOff: {
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  toggleText: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  toggleTextOn: {
    color: C.success,
  },
  toggleTextOff: {
    color: C.muted,
  },
  spacer: { flex: 1 },
  startBtn: {
    backgroundColor: C.selectedBg,
    borderWidth: 1,
    borderColor: C.brand,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startText: {
    fontFamily: MONO,
    fontSize: 15,
    fontWeight: '700',
    color: C.brand,
    letterSpacing: 2,
  },
});
