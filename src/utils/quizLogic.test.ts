import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateStats, filterQuestions, checkAnswer, Question, UserAnswerRecord } from './quizLogic.js';

const mockQuestions: Question[] = [
  {
    id: '1.0.1',
    unit: 'Algorithms',
    topic: 'Binary Tree',
    exam: 'UGC NET CSE | June 2012 | Part 2 | Question: 2',
    year: 'June 2012',
    paper: 'Part 2',
    page: 16,
    question: 'The post order traversal of a binary tree is DEBFCA. Find out the pre-order traversal',
    options: { A: 'ABFCDE', B: 'ADBFEC', C: 'ABDECF', D: 'None of the above' },
    hasOptions: true,
    rawKey: 'C',
    answer: 'C',
    explanation: 'Pre-order traversal is root left right.'
  },
  {
    id: '1.0.2',
    unit: 'Algorithms',
    topic: 'Graph Algorithms',
    exam: 'UGC NET CSE | August 2016 | Part 3 | Question: 36',
    year: 'August 2016',
    paper: 'Part 3',
    page: 16,
    question: 'Match the following with respect to algorithm paradigms',
    options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' },
    hasOptions: true,
    rawKey: 'A',
    answer: 'A',
    explanation: 'Graph algorithms matching.'
  },
  {
    id: '5.1.1',
    unit: 'Computer Networks',
    topic: 'IP Addressing',
    exam: 'UGC NET CSE | July 2018 | Part 2 | Question: 30',
    year: 'July 2018',
    paper: 'Part 2',
    page: 87,
    question: 'Which of the following IP address class is a multicast address?',
    options: { A: 'Class A', B: 'Class B', C: 'Class C', D: 'Class D' },
    hasOptions: true,
    rawKey: 'D',
    answer: 'D',
    explanation: 'Class D is multicast.'
  }
];

test('checkAnswer validates correctly', () => {
  assert.equal(checkAnswer('C', 'C'), true);
  assert.equal(checkAnswer('c', 'C'), true);
  assert.equal(checkAnswer('A', 'C'), false);
  assert.equal(checkAnswer('B', null), false);
});

test('calculateStats computes correct numbers and accuracy', () => {
  const userAnswers: Record<string, UserAnswerRecord> = {
    '1.0.1': { selectedOption: 'C', isCorrect: true, timestamp: Date.now() },
    '1.0.2': { selectedOption: 'B', isCorrect: false, timestamp: Date.now() }
  };

  const stats = calculateStats(mockQuestions, userAnswers);
  assert.equal(stats.totalQuestions, 3);
  assert.equal(stats.attemptedCount, 2);
  assert.equal(stats.correctCount, 1);
  assert.equal(stats.incorrectCount, 1);
  assert.equal(stats.accuracy, 50);
});

test('filterQuestions filters by unit, topic and status', () => {
  const userAnswers: Record<string, UserAnswerRecord> = {
    '1.0.1': { selectedOption: 'C', isCorrect: true, timestamp: Date.now(), starred: true },
    '1.0.2': { selectedOption: 'B', isCorrect: false, timestamp: Date.now() }
  };

  // Filter by unit
  const algos = filterQuestions(mockQuestions, 'Algorithms', 'all', '', 'all', userAnswers);
  assert.equal(algos.length, 2);

  // Filter by topic
  const tree = filterQuestions(mockQuestions, 'Algorithms', 'Binary Tree', '', 'all', userAnswers);
  assert.equal(tree.length, 1);
  assert.equal(tree[0].id, '1.0.1');

  // Filter by status: unattempted
  const unattempted = filterQuestions(mockQuestions, 'all', 'all', '', 'unattempted', userAnswers);
  assert.equal(unattempted.length, 1);
  assert.equal(unattempted[0].id, '5.1.1');

  // Filter by status: correct
  const correct = filterQuestions(mockQuestions, 'all', 'all', '', 'correct', userAnswers);
  assert.equal(correct.length, 1);
  assert.equal(correct[0].id, '1.0.1');

  // Filter by status: starred
  const starred = filterQuestions(mockQuestions, 'all', 'all', '', 'starred', userAnswers);
  assert.equal(starred.length, 1);
  assert.equal(starred[0].id, '1.0.1');

  // Search filter
  const searchMulticast = filterQuestions(mockQuestions, 'all', 'all', 'multicast', 'all', userAnswers);
  assert.equal(searchMulticast.length, 1);
  assert.equal(searchMulticast[0].id, '5.1.1');
});
