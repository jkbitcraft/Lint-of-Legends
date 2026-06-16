import { Platform } from 'react-native';

export const C = {
  bg:              '#080808',
  surface:         '#101010',
  surfaceElevated: '#1a1a1a',
  border:          '#2a2a2a',
  borderSubtle:    '#1e1e1e',
  brand:           '#ff6b35',
  success:         '#00ff88',
  error:           '#ff2244',
  revealed:        '#ff6b35',
  selectedBg:      '#1a0800',
  correctBg:       '#001a0a',
  wrongBg:         '#1a0008',
  revealedBg:      '#1a0800',
  text:            '#e6edf3',
  muted:           '#8b949e',
  lineNum:         '#404040',
} as const;

export const MONO = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

export const DIVIDER = '════════════════════════════════';
