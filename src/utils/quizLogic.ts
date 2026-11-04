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
}

export type FilterStatus = 'all' | 'unattempted' | 'correct' | 'incorrect' | 'starred';

export function calculateStats(
  questions: Question[],
  userAnswers: Record<string, UserAnswerRecord>
) {
  const attemptedCount = Object.keys(userAnswers).filter(id => userAnswers[id]?.selectedOption).length;
  let correctCount = 0;
  let incorrectCount = 0;

  for (const id in userAnswers) {
    const ans = userAnswers[id];
    if (ans && ans.selectedOption) {
      if (ans.isCorrect) correctCount++;
      else incorrectCount++;
    }
  }

  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  return {
    totalQuestions: questions.length,
    attemptedCount,
    correctCount,
    incorrectCount,
    accuracy,
  };
}

export function filterQuestions(
  questions: Question[],
  selectedUnit: string,
  selectedTopic: string,
  searchQuery: string,
  filterStatus: FilterStatus,
  userAnswers: Record<string, UserAnswerRecord>,
  selectedYear: string = 'all'
): Question[] {
  const qLower = searchQuery.trim().toLowerCase();

  return questions.filter(q => {
    // Unit filter
    if (selectedUnit !== 'all' && q.unit !== selectedUnit) {
      return false;
    }

    // Topic filter
    if (selectedTopic !== 'all' && q.topic !== selectedTopic) {
      return false;
    }

    // Year filter
    if (selectedYear !== 'all') {
      if (!q.year.includes(selectedYear) && !q.exam.includes(selectedYear)) {
        return false;
      }
    }

    // Search query
    if (qLower) {
      const matchQ = q.question.toLowerCase().includes(qLower);
      const matchExam = q.exam.toLowerCase().includes(qLower);
      const matchTopic = q.topic.toLowerCase().includes(qLower);
      const matchOptions = Object.values(q.options).some(opt => opt.toLowerCase().includes(qLower));
      if (!matchQ && !matchExam && !matchTopic && !matchOptions) {
        return false;
      }
    }

    // Status filter
    const userAns = userAnswers[q.id];
    if (filterStatus === 'unattempted') {
      if (userAns && userAns.selectedOption) return false;
    } else if (filterStatus === 'correct') {
      if (!userAns || !userAns.isCorrect) return false;
    } else if (filterStatus === 'incorrect') {
      if (!userAns || !userAns.selectedOption || userAns.isCorrect) return false;
    } else if (filterStatus === 'starred') {
      if (!userAns || !userAns.starred) return false;
    }

    return true;
  });
}

export function checkAnswer(selectedOption: string, correctAnswer: string | null): boolean {
  if (!correctAnswer) return false;
  return selectedOption.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
}
