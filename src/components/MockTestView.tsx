import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  Bookmark, 
  RotateCcw, 
  Award, 
  Play, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Question, UserAnswerRecord } from '../types';

interface MockTestViewProps {
  allQuestions: Question[];
  units: { name: string; count: number }[];
  onExit: () => void;
  onOpenPdf: (page: number) => void;
}

export const MockTestView: React.FC<MockTestViewProps> = ({
  allQuestions,
  units,
  onExit,
  onOpenPdf,
}) => {
  // Setup State
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);

  // Active Test State
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, { option: string | null; markedForReview: boolean }>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);

  // Start the test
  const handleStartTest = () => {
    let pool = allQuestions;
    if (selectedUnit !== 'all') {
      pool = allQuestions.filter(q => q.unit === selectedUnit);
    }
    // Shuffle and pick
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    setTestQuestions(selected);
    setCurrentIndex(0);
    setTestAnswers({});
    setTimeLeftSeconds(durationMinutes * 60);
    setTestStarted(true);
    setTestSubmitted(false);
  };

  // Timer effect
  useEffect(() => {
    if (!testStarted || testSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testSubmitted]);

  const handleSelectOption = (option: string) => {
    if (testSubmitted) return;
    const curQ = testQuestions[currentIndex];
    if (!curQ) return;

    setTestAnswers(prev => ({
      ...prev,
      [curQ.id]: {
        option: prev[curQ.id]?.option === option ? null : option,
        markedForReview: prev[curQ.id]?.markedForReview || false,
      }
    }));
  };

  const handleToggleReview = () => {
    const curQ = testQuestions[currentIndex];
    if (!curQ) return;

    setTestAnswers(prev => ({
      ...prev,
      [curQ.id]: {
        option: prev[curQ.id]?.option || null,
        markedForReview: !prev[curQ.id]?.markedForReview,
      }
    }));
  };

  const handleClearResponse = () => {
    const curQ = testQuestions[currentIndex];
    if (!curQ) return;

    setTestAnswers(prev => ({
      ...prev,
      [curQ.id]: {
        option: null,
        markedForReview: prev[curQ.id]?.markedForReview || false,
      }
    }));
  };

  const handleSubmitTest = () => {
    setTestSubmitted(true);
  };

  // Calculate Test Score
  const scoreStats = React.useMemo(() => {
    if (!testSubmitted) return null;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    testQuestions.forEach(q => {
      const ans = testAnswers[q.id]?.option;
      if (!ans) {
        unattempted++;
      } else if (ans === q.answer) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const marks = correct * 2; // UGC NET awards 2 marks per question, no negative marking in general
    const maxMarks = testQuestions.length * 2;
    const accuracy = correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;

    return {
      total: testQuestions.length,
      correct,
      incorrect,
      unattempted,
      marks,
      maxMarks,
      accuracy,
    };
  }, [testSubmitted, testQuestions, testAnswers]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If Test has not started, show Test Setup Screen
  if (!testStarted) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">UGC NET Mock Test Simulation</h1>
                <p className="text-xs text-slate-500">Timed Computer-Based Test (CBT) with detailed scorecard</p>
              </div>
            </div>
            <button
              onClick={onExit}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Exit to Practice
            </button>
          </div>

          <div className="space-y-4">
            {/* Choose Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Select Syllabus Subject / Unit
              </label>
              <select
                value={selectedUnit}
                onChange={e => setSelectedUnit(e.target.value)}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="all">Full Computer Science Syllabus (All Units)</option>
                {units.map(u => (
                  <option key={u.name} value={u.name}>
                    {u.name} ({u.count} questions available)
                  </option>
                ))}
              </select>
            </div>

            {/* Question count */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Number of Questions
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 50].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        questionCount === cnt
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Time Limit
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        durationMinutes === mins
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Rules Info Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>NTA Exam Pattern Guidelines:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Each correct answer carries <strong>+2 marks</strong>.</li>
                <li>There is <strong>no negative marking</strong> for incorrect responses.</li>
                <li>Questions can be marked for review and answered in any sequence using the question palette.</li>
                <li>After completing or when time runs out, your detailed performance report with explanations will be revealed.</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartTest}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Mock Test</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If Test is Submitted, show Comprehensive Results & Review View
  if (testSubmitted && scoreStats) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        
        {/* Score Card Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/25">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Mock Test Results
          </h2>
          <p className="text-sm text-slate-500">
            {selectedUnit === 'all' ? 'Full UGC NET CSE Mock Exam' : selectedUnit}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 max-w-2xl mx-auto">
            <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-100">
              <div className="text-2xl font-black text-indigo-700 font-mono">
                {scoreStats.marks} <span className="text-xs font-normal text-slate-500">/ {scoreStats.maxMarks}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mt-1">Total Score</div>
            </div>

            <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-100">
              <div className="text-2xl font-black text-emerald-700 font-mono">
                {scoreStats.accuracy}%
              </div>
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mt-1">Accuracy</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-2xl font-black text-emerald-600 font-mono">
                {scoreStats.correct} <span className="text-xs font-normal text-slate-400">Correct</span>
              </div>
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mt-1">{scoreStats.incorrect} Wrong</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-2xl font-black text-slate-700 font-mono">
                {scoreStats.unattempted}
              </div>
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mt-1">Skipped</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartTest}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Test</span>
            </button>
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <span>Back to Practice Mode</span>
            </button>
          </div>
        </div>

        {/* Question Review Section with Explanations */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Question Review & Explanations ({testQuestions.length})</span>
          </h3>

          {testQuestions.map((q, idx) => {
            const userChoice = testAnswers[q.id]?.option || null;
            const isUserCorrect = userChoice === q.answer;

            return (
              <div 
                key={q.id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                      Q{idx + 1}
                    </span>
                    <span className="font-semibold text-indigo-600">{q.unit}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{q.topic}</span>
                  </div>
                  
                  <div>
                    {userChoice ? (
                      isUserCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+2)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect (0)
                        </span>
                      )
                    ) : (
                      <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        Unattempted
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm font-medium text-slate-900">
                  {q.question}
                </div>

                {/* Options Review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(['A', 'B', 'C', 'D'] as const).map(k => {
                    const isCorrect = q.answer === k;
                    const isChosen = userChoice === k;
                    let style = 'bg-slate-50 border-slate-200 text-slate-700';

                    if (isCorrect) {
                      style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                    } else if (isChosen && !isCorrect) {
                      style = 'bg-rose-50 border-rose-500 text-rose-950 font-semibold ring-1 ring-rose-500';
                    }

                    return (
                      <div key={k} className={`p-2.5 rounded-lg border flex items-center justify-between ${style}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{k}.</span>
                          <span>{q.options[k] || `(Option ${k})`}</span>
                        </div>
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {isChosen && !isCorrect && <XCircle className="w-4 h-4 text-rose-600" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-indigo-900 text-[11px] uppercase tracking-wide">
                    Explanation:
                  </div>
                  <p className="whitespace-pre-line leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    );
  }

  // Active Test Screen
  const currentQ = testQuestions[currentIndex];
  const currentAnswer = testAnswers[currentQ?.id]?.option || null;
  const isMarked = !!testAnswers[currentQ?.id]?.markedForReview;

  return (
    <div className="max-w-6xl mx-auto py-4 px-3 sm:px-6">
      
      {/* Top Test Header with Timer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-sm">
            Mock Test: {selectedUnit === 'all' ? 'All Units' : selectedUnit}
          </span>
          <span className="text-xs text-slate-500">
            (Question {currentIndex + 1} of {testQuestions.length})
          </span>
        </div>

        {/* Live Timer */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${
            timeLeftSeconds < 300 
              ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
              : 'bg-slate-100 text-slate-800 border-slate-200'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={handleSubmitTest}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Submit Test
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Main Question Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 space-y-5 shadow-xs">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-600 text-white font-mono">
                  Question {currentIndex + 1}
                </span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {currentQ?.unit}
                </span>
                <span className="text-[11px] text-slate-400">
                  +2.0 Marks / 0 Negative
                </span>
              </div>

              <button
                onClick={handleToggleReview}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  isMarked 
                    ? 'bg-purple-50 text-purple-700 border-purple-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isMarked ? 'fill-purple-600' : ''}`} />
                <span>{isMarked ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="text-base font-medium text-slate-900 leading-relaxed">
              {currentQ?.question}
            </div>

            {/* Options */}
            <div className="space-y-2.5 pt-2">
              {(['A', 'B', 'C', 'D'] as const).map(k => {
                const isSelected = currentAnswer === k;
                return (
                  <button
                    key={k}
                    onClick={() => handleSelectOption(k)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-600/20 text-indigo-950 font-medium'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                        isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {k}
                      </span>
                      <span className="text-sm break-words">
                        {currentQ?.options[k] || `(Option ${k})`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Question Bottom Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={handleClearResponse}
                disabled={!currentAnswer}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors border border-slate-200"
              >
                Clear Response
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => setCurrentIndex(p => Math.min(testQuestions.length - 1, p + 1))}
                  disabled={currentIndex === testQuestions.length - 1}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs disabled:opacity-40 transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Question Palette */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Question Palette ({testQuestions.length})
            </h3>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                <span>Marked Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span>Unvisited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-indigo-600 bg-white" />
                <span>Current</span>
              </div>
            </div>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto p-1">
              {testQuestions.map((q, idx) => {
                const ans = testAnswers[q.id]?.option;
                const rev = testAnswers[q.id]?.markedForReview;
                const isCur = idx === currentIndex;

                let bg = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (ans) bg = 'bg-emerald-600 text-white font-bold';
                if (rev) bg = 'bg-purple-600 text-white font-bold';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-8 rounded-lg text-xs font-mono font-medium transition-all ${bg} ${
                      isCur ? 'ring-2 ring-indigo-600 ring-offset-1' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSubmitTest}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-xs hover:from-emerald-700 hover:to-teal-700 transition-colors"
            >
              Submit & View Score
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
