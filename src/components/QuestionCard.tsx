import React, { useState } from 'react';
import { 
  Check, 
  X, 
  HelpCircle, 
  FileText, 
  Star, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  FileEdit, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { Question, UserAnswerRecord } from '../types';
import { playSuccessSound, playErrorSound } from '../utils/soundEffects';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalFiltered: number;
  userAnswer?: UserAnswerRecord;
  onSelectOption: (questionId: string, option: string) => void;
  onToggleStar: (questionId: string) => void;
  onSaveNotes: (questionId: string, notes: string) => void;
  onOpenPdf: (page: number) => void;
  fontSize?: 'sm' | 'base' | 'lg';
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  totalFiltered,
  userAnswer,
  onSelectOption,
  onToggleStar,
  onSaveNotes,
  onOpenPdf,
  fontSize = 'base',
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(userAnswer?.notes || '');
  const [showAnswerDirectly, setShowAnswerDirectly] = useState(false);

  const selectedOption = userAnswer?.selectedOption || null;
  const isAnswered = selectedOption !== null || showAnswerDirectly;
  const isCorrect = selectedOption && selectedOption === question.answer;
  const isStarred = !!userAnswer?.starred;

  const fontClasses = {
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
  }[fontSize];

  const handleOptionClick = (optKey: string) => {
    onSelectOption(question.id, optKey);
    if (question.answer === optKey) {
      playSuccessSound();
    } else {
      playErrorSound();
    }
    // Automatically show explanation if answered or keep it toggleable
    setShowExplanation(true);
  };

  const handleSaveNotes = () => {
    onSaveNotes(question.id, notesText);
    setIsEditingNotes(false);
  };

  const handleRevealAnswer = () => {
    setShowAnswerDirectly(true);
    setShowExplanation(true);
  };

  const handleResetQuestion = () => {
    onSelectOption(question.id, '');
    setShowAnswerDirectly(false);
    setShowExplanation(false);
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden">
      
      {/* Question Header */}
      <div className="bg-slate-50/80 px-4 sm:px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center flex-wrap gap-2">
          {/* Question Index Badge */}
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-2xs font-mono">
            Q {questionIndex + 1}
            <span className="opacity-70 font-normal ml-1">/ {totalFiltered}</span>
          </span>

          {/* Unit & Topic Badges */}
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            {question.unit}
          </span>
          {question.topic && question.topic !== question.unit && (
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
              {question.topic}
            </span>
          )}

          {/* Exam info badge */}
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-500 bg-white border border-slate-200">
            {question.exam}
          </span>
        </div>

        {/* Header Actions (Star, PDF Page) */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => onOpenPdf(question.page)}
            title={`View in Original PDF (Page ${question.page})`}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-mono">p.{question.page}</span>
          </button>

          <button
            onClick={() => onToggleStar(question.id)}
            title={isStarred ? "Remove from Starred / Bookmarks" : "Star for Revision"}
            className={`p-1.5 rounded-lg border transition-colors ${
              isStarred
                ? 'bg-amber-50 text-amber-500 border-amber-300'
                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-50 border-slate-200'
            }`}
            aria-label={isStarred ? "Starred question" : "Star question"}
          >
            <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Question Body */}
      <div className="p-4 sm:p-6 space-y-4">
        
        {/* Question Text */}
        <div className={`font-medium text-slate-900 leading-relaxed ${fontClasses}`}>
          {question.question.split('\n').map((paragraph, pIdx) => {
            const isCodeBlock = paragraph.includes('{') || paragraph.includes(';') || paragraph.startsWith('int ') || paragraph.startsWith('for(');
            return isCodeBlock ? (
              <pre key={pIdx} className="my-2 p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto shadow-inner">
                <code>{paragraph}</code>
              </pre>
            ) : (
              <p key={pIdx} className="mb-2 last:mb-0">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* 4 Interactive Options */}
        <div className="space-y-2.5 pt-2">
          {(['A', 'B', 'C', 'D'] as const).map(optKey => {
            const optVal = question.options[optKey];
            if (!optVal && !question.hasOptions) return null;

            const isSelected = selectedOption === optKey;
            const isThisTheCorrectAnswer = question.answer === optKey;

            // Determine styling based on user click
            let buttonStyles = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:border-slate-300';
            let badgeStyles = 'bg-slate-100 text-slate-600 border-slate-200';
            let icon = null;

            if (isAnswered) {
              if (isThisTheCorrectAnswer) {
                // Correct option is always highlighted green once answered or revealed
                buttonStyles = 'border-emerald-500 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-500/30';
                badgeStyles = 'bg-emerald-600 text-white border-emerald-600';
                icon = <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />;
              } else if (isSelected && !isThisTheCorrectAnswer) {
                // Wrong clicked option highlighted red
                buttonStyles = 'border-rose-500 bg-rose-50/90 text-rose-950 ring-2 ring-rose-500/30';
                badgeStyles = 'bg-rose-600 text-white border-rose-600';
                icon = <X className="w-4 h-4 text-rose-600 shrink-0 font-bold" />;
              } else {
                // Unselected wrong options dimmed
                buttonStyles = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
                badgeStyles = 'bg-slate-100 text-slate-400 border-slate-200';
              }
            }

            return (
              <button
                key={optKey}
                onClick={() => handleOptionClick(optKey)}
                className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl border text-left transition-all ${buttonStyles} group cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border transition-colors ${badgeStyles}`}>
                    {optKey}
                  </span>
                  <span className={`text-sm ${fontClasses} break-words leading-snug`}>
                    {optVal || `(Option ${optKey})`}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAnswered && isThisTheCorrectAnswer && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      Correct Answer
                    </span>
                  )}
                  {isAnswered && isSelected && !isThisTheCorrectAnswer && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                      Incorrect
                    </span>
                  )}
                  {icon}
                </div>
              </button>
            );
          })}
        </div>

        {/* Answer Feedback Banner */}
        {isAnswered && selectedOption && (
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
            isCorrect 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div className="text-xs sm:text-sm font-semibold">
                {isCorrect ? (
                  <span>Sahi Jawab! (+2 Marks) Option {question.answer} is correct.</span>
                ) : (
                  <span>Galat Jawab! Sahi uttar hai: Option {question.answer}.</span>
                )}
              </div>
            </div>

            <button
              onClick={handleResetQuestion}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-2xs transition-colors shrink-0 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            
            {/* Show Answer button */}
            {!isAnswered && (
              <button
                onClick={handleRevealAnswer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Show Answer</span>
              </button>
            )}

            {/* Toggle Detailed Explanation */}
            <button
              onClick={() => setShowExplanation(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                showExplanation
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
            >
              {showExplanation ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Explanation</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detailed Solution</span>
                </>
              )}
            </button>

            {/* Personal Notes button */}
            <button
              onClick={() => setIsEditingNotes(p => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Notes {userAnswer?.notes ? '•' : ''}</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Key ID: {question.id}
          </span>
        </div>

        {/* Detailed Explanation Drawer */}
        {showExplanation && (
          <div className="mt-3 p-4 bg-gradient-to-br from-indigo-50/60 to-slate-50 border border-indigo-100 rounded-xl space-y-2 text-xs sm:text-sm text-slate-800 animate-fadeIn">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 uppercase tracking-wider text-[11px]">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Explanation & Solution</span>
            </div>
            
            <div className="whitespace-pre-line leading-relaxed text-slate-700 bg-white/80 p-3 rounded-lg border border-indigo-100/60 font-sans">
              {question.explanation}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Official UGC NET Key: <strong className="text-slate-900 font-mono">{question.answer || question.rawKey}</strong></span>
              <button
                onClick={() => onOpenPdf(question.page)}
                className="text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>Check page {question.page} in original PDF</span>
                <FileText className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Notes Editor Drawer */}
        {isEditingNotes && (
          <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Personal Study Notes & Formulas for this Question:
            </label>
            <textarea
              rows={3}
              value={notesText}
              onChange={e => setNotesText(e.target.value)}
              placeholder="e.g. Remember: in BCNF every LHS must be superkey. Time complexity formula O(V³)..."
              className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingNotes(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        )}

      </div>

    </article>
  );
};
