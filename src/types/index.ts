export type Language = 'python' | 'javascript' | 'html_css';
export type Difficulty = 'beginner' | 'intermediate';
export type BugType = 'syntax' | 'logic' | 'style';

export interface Bug {
  lines: number[];       // 1-indexed line numbers
  explanation: string;
}

export interface Question {
  id: string;
  language: Language;
  difficulty: Difficulty;
  bug_type: BugType | BugType[];
  title: string;
  code: string;
  bugs: Bug[];           // empty array = no bugs
}

// 'revealed' is used only when the user gives up — shown in amber, not green
export type LineState =
  | 'idle'
  | 'selected'
  | 'correct'
  | 'missed'
  | 'false_positive'
  | 'revealed';

export interface GradeResult {
  passed: boolean;
  lineStates: Record<number, LineState>;
  usedGiveUp: boolean;
  // SCORING_PLACEHOLDER: score delta, streak increment, xp earned
}
