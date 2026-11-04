import React from 'react';
import { X, CheckCircle2, XCircle, BarChart3, Award, Zap, RotateCcw } from 'lucide-react';
import { UnitInfo, UserAnswerRecord } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: UnitInfo[];
  userAnswers: Record<string, UserAnswerRecord>;
  onResetProgress: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  units,
  userAnswers,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  // Compute unit-wise performance
  let overallAttempted = 0;
  let overallCorrect = 0;
  let overallIncorrect = 0;

  for (const id in userAnswers) {
    if (userAnswers[id]?.selectedOption) {
      overallAttempted++;
      if (userAnswers[id].isCorrect) overallCorrect++;
      else overallIncorrect++;
    }
  }

  const overallAccuracy = overallAttempted > 0 
    ? Math.round((overallCorrect / overallAttempted) * 100) 
    : 0;

  // Build unit breakdown
  const unitStats = units.map(u => {
    // Find how many questions in this unit were attempted and correct
    // Question ids for a unit start with unit prefix or we match against userAnswers
    let unitAttempted = 0;
    let unitCorrect = 0;
    
    // Check answer records that belong to this unit (by inspecting topic/unit if available)
    for (const id in userAnswers) {
      const rec = userAnswers[id];
      if (rec?.selectedOption) {
        // match id with unit
        if (id.startsWith(u.name.split(' ')[0]) || (u.name.includes('Algorithms') && id.startsWith('1.'))
          || (u.name.includes('Artificial') && id.startsWith('2.'))
          || (u.name.includes('Architecture') && id.startsWith('3.'))
          || (u.name.includes('Compiler') && id.startsWith('4.'))
          || (u.name.includes('Networks') && id.startsWith('5.'))
          || (u.name.includes('Data Mining') && id.startsWith('6.'))
          || (u.name.includes('Databases') && id.startsWith('7.'))
          || (u.name.includes('Digital') && id.startsWith('8.'))
          || (u.name.includes('Operating System') && id.startsWith('35.'))
          || (u.name.includes('Theory of Computation') && id.startsWith('40.'))
        ) {
          unitAttempted++;
          if (rec.isCorrect) unitCorrect++;
        }
      }
    }

    const accuracy = unitAttempted > 0 ? Math.round((unitCorrect / unitAttempted) * 100) : 0;
    return {
      name: u.name,
      total: u.count,
      attempted: unitAttempted,
      correct: unitCorrect,
      accuracy,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Performance Analytics</h2>
              <p className="text-xs text-slate-500">Track accuracy and weak topics across syllabus units</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Attempted</span>
              <div className="text-2xl font-black text-slate-800 font-mono mt-1">
                {overallAttempted}
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
              </span>
              <div className="text-2xl font-black text-emerald-800 font-mono mt-1">
                {overallCorrect}
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
              <span className="text-[11px] font-bold text-indigo-700 uppercase flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Accuracy
              </span>
              <div className="text-2xl font-black text-indigo-800 font-mono mt-1">
                {overallAccuracy}%
              </div>
            </div>
          </div>

          {/* Unit Progress Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Unit-wise Coverage & Accuracy</span>
            </h3>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {unitStats.slice(0, 15).map(u => (
                <div key={u.name} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={u.name}>
                      {u.name}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {u.attempted}/{u.total} ({u.accuracy}% acc)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.round((u.attempted / Math.max(1, u.total)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to reset all answers and progress?")) {
                onResetProgress();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Progress</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
