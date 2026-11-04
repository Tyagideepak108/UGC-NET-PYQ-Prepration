export interface Question {
  id: string;
  unit: string;
  topic: string;
  exam: string;
  year: string;
  paper: string;
  page: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  hasOptions: boolean;
  rawKey: string;
  answer: string | null;
  explanation: string;
}

export interface UserAnswerRecord {
  selectedOption: string | null;
  isCorrect: boolean;
  timestamp: number;
  starred?: boolean;
  notes?: string;
  markedForReview?: boolean;
}

export type ViewMode = 'single' | 'list';
export type AppMode = 'practice' | 'mock';
export type FilterStatus = 'all' | 'unattempted' | 'correct' | 'incorrect' | 'starred';

export interface UnitInfo {
  name: string;
  count: number;
  topics: { name: string; count: number }[];
}

export interface MockTestConfig {
  unit: string;
  topic: string;
  questionCount: number;
  timeMinutes: number;
}
