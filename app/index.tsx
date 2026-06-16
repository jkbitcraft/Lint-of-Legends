import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Language, Difficulty } from '../src/types';
import { useSettings } from '../src/context/SettingsContext';

const LANGUAGES: { label: string; value: Language; enabled: boolean }[] = [
  { label: 'Python', value: 'python', enabled: true },
  { label: 'JavaScript', value: 'javascript', enabled: false },
  { label: 'HTML / CSS', value: 'html_css', enabled: false },
];

const DIFFICULTIES: { label: string; value: Difficulty; enabled: boolean }[] = [
  { label: 'Beginner', value: 'beginner', enabled: true },
  { label: 'Intermediate', value: 'intermediate', enabled: false },
];

export default function HomeScreen() {
  const [lang, setLang] = useState<Language>('python');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const { settings, toggleBugCount } = useSettings();
  const isBeginner = difficulty === 'beginner';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>Code Review</Text>
          <Text style={styles.subtitle}>Spot the bug. Level up.</Text>
        </View>

        <Text style={styles.label}>Language</Text>
        <View style={styles.row}>
          {LANGUAGES.map((item) => (
            <TouchableOpacity
              key={item.value}
              disabled={!item.enabled}
              onPress={() => setLang(item.value)}
              style={[
                styles.chip,
                lang === item.value && item.enabled && styles.chipActive,
                !item.enabled && styles.chipDisabled,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  lang === item.value && item.enabled && styles.chipTextActive,
                  !item.enabled && styles.chipTextMuted,
                ]}
              >
                {item.label}
                {!item.enabled ? '  (soon)' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.row}>
          {DIFFICULTIES.map((item) => (
            <TouchableOpacity
              key={item.value}
              disabled={!item.enabled}
              onPress={() => setDifficulty(item.value)}
              style={[
                styles.chip,
                difficulty === item.value && item.enabled && styles.chipActive,
                !item.enabled && styles.chipDisabled,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  difficulty === item.value && item.enabled && styles.chipTextActive,
                  !item.enabled && styles.chipTextMuted,
                ]}
              >
                {item.label}
                {!item.enabled ? '  (soon)' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isBeginner && (
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Show bug count after submit</Text>
              <Text style={styles.settingHint}>
                Reveals how many bugs were in the snippet once you submit
              </Text>
            </View>
            <Switch
              value={settings.showBugCount}
              onValueChange={toggleBugCount}
              trackColor={{ false: '#1E293B', true: '#2563EB' }}
              thumbColor="#F8FAFC"
            />
          </View>
        )}

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() =>
            router.push({
              pathname: '/quiz',
              params: { language: lang, difficulty },
            })
          }
        >
          <Text style={styles.startText}>Start →</Text>
        </TouchableOpacity>

        {/* SCORING_PLACEHOLDER: display streak, total solved, personal bests here */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1, padding: 24, paddingTop: 40 },
  hero: { marginBottom: 40 },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 16, color: '#475569', marginTop: 4 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  chipActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#172554',
  },
  chipDisabled: { opacity: 0.35 },
  chipText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 15,
  },
  chipTextActive: { color: '#93C5FD' },
  chipTextMuted: { color: '#475569' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 14,
    gap: 12,
  },
  settingText: { flex: 1 },
  settingLabel: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  settingHint: { color: '#64748B', fontSize: 12, lineHeight: 17 },
  spacer: { flex: 1 },
  startBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startText: { color: '#fff', fontWeight: '800', fontSize: 18, letterSpacing: 0.3 },
});
