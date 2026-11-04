import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  RotateCcw, 
  BarChart3, 
  Menu,
  Sparkles
} from 'lucide-react';
import { AppMode } from '../types';

interface NavbarProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  stats: {
    totalQuestions: number;
    attemptedCount: number;
    correctCount: number;
    incorrectCount: number;
    accuracy: number;
  };
  onOpenPdf: (page?: number) => void;
  onOpenStats: () => void;
  onResetProgress: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  setMode,
  stats,
  onOpenPdf,
  onOpenStats,
  onResetProgress,
  onToggleSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Brand & Sidebar toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle Sidebar Navigation"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                    UGC NET <span className="text-indigo-600">CSE</span> Prep
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    <Sparkles className="w-3 h-3 text-indigo-500" /> 750+ Pages PYQ Bank
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Topic-wise & Chapter-wise Interactive Solver
                </p>
              </div>
            </div>
          </div>

          {/* Center: Mode switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setMode('practice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'practice'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Practice Mode</span>
            </button>
            <button
              onClick={() => setMode('mock')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'mock'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Mock Test</span>
            </button>
          </div>

          {/* Right: Quick Stats & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick stats pills */}
            <div 
              onClick={onOpenStats}
              title="Click to see detailed performance analytics"
              className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{stats.correctCount}</span>
              </div>
              <div className="w-px h-3.5 bg-slate-200" />
              <div className="flex items-center gap-1.5 text-xs text-rose-700 font-medium">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>{stats.incorrectCount}</span>
              </div>
              <div className="w-px h-3.5 bg-slate-200" />
              <span className="text-xs font-semibold text-slate-700">
                {stats.accuracy}% Acc
              </span>
            </div>

            {/* Performance modal button */}
            <button
              onClick={onOpenStats}
              title="Detailed Performance Analysis"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/80"
              aria-label="View Performance Statistics"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
            </button>

            {/* View Original PDF button */}
            <button
              onClick={() => onOpenPdf(1)}
              title="View Original 750-Page UGC NET PYQ PDF"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Original PDF</span>
            </button>

            {/* Reset progress button */}
            <button
              onClick={onResetProgress}
              title="Reset All Progress and Answers"
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-slate-200/80"
              aria-label="Reset All Answers"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
