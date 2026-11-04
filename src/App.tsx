import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  ListFilter, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  FileText, 
  RotateCcw, 
  SlidersHorizontal,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';

import questionsData from './data/pyq-database.json';
import unitsSummaryData from './data/units-summary.json';

import { Question, UserAnswerRecord, AppMode, ViewMode, FilterStatus, UnitInfo } from './types';
import { filterQuestions, calculateStats, checkAnswer } from './utils/quizLogic';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { QuestionCard } from './components/QuestionCard';
import { MockTestView } from './components/MockTestView';
import { PdfModal } from './components/PdfModal';
import { StatsModal } from './components/StatsModal';

const allQuestionsList = questionsData as Question[];

export default function App() {
  // App navigation state
  const [appMode, setAppMode] = useState<AppMode>('practice');
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  // Filter state
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Single mode active index & list pagination
  const [currentSingleIndex, setCurrentSingleIndex] = useState<number>(0);
  const [listPage, setListPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modals state
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // User answers & bookmarks stored in localStorage
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswerRecord>>(() => {
    try {
      const saved = localStorage.getItem('ugc_net_cse_answers_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Auto-adapt sidebar state when screen resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('ugc_net_cse_answers_v1', JSON.stringify(userAnswers));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [userAnswers]);

  // Transform units summary
  const unitsList: UnitInfo[] = useMemo(() => {
    const list: UnitInfo[] = [];
    for (const [unitName, val] of Object.entries(unitsSummaryData as Record<string, { count: number; topics: Record<string, number> }>)) {
      const topicsArr = Object.entries(val.topics || {})
        .map(([tName, tCount]) => ({ name: tName, count: tCount }))
        .sort((a, b) => b.count - a.count);
      list.push({
        name: unitName,
        count: val.count,
        topics: topicsArr
      });
    }
    return list.sort((a, b) => b.count - a.count);
  }, []);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return filterQuestions(
      allQuestionsList,
      selectedUnit,
      selectedTopic,
      searchQuery,
      filterStatus,
      userAnswers,
      selectedYear
    );
  }, [selectedUnit, selectedTopic, searchQuery, filterStatus, userAnswers, selectedYear]);

  // Reset index when filters change
  useEffect(() => {
    setCurrentSingleIndex(0);
    setListPage(1);
  }, [selectedUnit, selectedTopic, searchQuery, filterStatus, selectedYear]);

  // Overall Stats
  const stats = useMemo(() => {
    return calculateStats(allQuestionsList, userAnswers);
  }, [userAnswers]);

  // Available Years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    allQuestionsList.forEach(q => {
      if (q.year && q.year !== 'UGC NET') {
        const yOnly = q.year.match(/\d{4}/);
        if (yOnly) years.add(yOnly[0]);
      }
    });
    return Array.from(years).sort().reverse();
  }, []);

  // Handlers for user interactions
  const handleSelectOption = useCallback((questionId: string, option: string) => {
    setUserAnswers(prev => {
      const targetQ = allQuestionsList.find(q => q.id === questionId);
      const isCorrect = option ? checkAnswer(option, targetQ?.answer || null) : false;
      return {
        ...prev,
        [questionId]: {
          selectedOption: option || null,
          isCorrect,
          timestamp: Date.now(),
          starred: prev[questionId]?.starred || false,
          notes: prev[questionId]?.notes || '',
        }
      };
    });
  }, []);

  const handleToggleStar = useCallback((questionId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: {
        selectedOption: prev[questionId]?.selectedOption || null,
        isCorrect: prev[questionId]?.isCorrect || false,
        timestamp: prev[questionId]?.timestamp || Date.now(),
        starred: !prev[questionId]?.starred,
        notes: prev[questionId]?.notes || '',
      }
    }));
  }, []);

  const handleSaveNotes = useCallback((questionId: string, notes: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: {
        selectedOption: prev[questionId]?.selectedOption || null,
        isCorrect: prev[questionId]?.isCorrect || false,
        timestamp: prev[questionId]?.timestamp || Date.now(),
        starred: prev[questionId]?.starred || false,
        notes,
      }
    }));
  }, []);

  const handleResetProgress = () => {
    setUserAnswers({});
    localStorage.removeItem('ugc_net_cse_answers_v1');
  };

  const handleOpenPdf = (page: number = 1) => {
    setPdfPage(page);
    setIsPdfOpen(true);
  };

  // Keyboard navigation for single mode
  useEffect(() => {
    if (appMode !== 'practice' || viewMode !== 'single') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'n') {
        setCurrentSingleIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'p') {
        setCurrentSingleIndex(prev => Math.max(0, prev - 1));
      } else if (['1', 'a', 'A'].includes(e.key)) {
        const curQ = filteredQuestions[currentSingleIndex];
        if (curQ) handleSelectOption(curQ.id, 'A');
      } else if (['2', 'b', 'B'].includes(e.key)) {
        const curQ = filteredQuestions[currentSingleIndex];
        if (curQ) handleSelectOption(curQ.id, 'B');
      } else if (['3', 'c', 'C'].includes(e.key)) {
        const curQ = filteredQuestions[currentSingleIndex];
        if (curQ) handleSelectOption(curQ.id, 'C');
      } else if (['4', 'd', 'D'].includes(e.key)) {
        const curQ = filteredQuestions[currentSingleIndex];
        if (curQ) handleSelectOption(curQ.id, 'D');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appMode, viewMode, filteredQuestions, currentSingleIndex, handleSelectOption]);

  // Current question in single view
  const currentQuestion = filteredQuestions[currentSingleIndex];

  // Paginated questions in list view
  const paginatedListQuestions = useMemo(() => {
    const start = (listPage - 1) * itemsPerPage;
    return filteredQuestions.slice(start, start + itemsPerPage);
  }, [filteredQuestions, listPage]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Navbar */}
      <Navbar
        mode={appMode}
        setMode={setAppMode}
        stats={stats}
        onOpenPdf={handleOpenPdf}
        onOpenStats={() => setIsStatsOpen(true)}
        onResetProgress={handleResetProgress}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Layout Area */}
      {appMode === 'mock' ? (
        <MockTestView
          allQuestions={allQuestionsList}
          units={unitsList}
          onExit={() => setAppMode('practice')}
          onOpenPdf={handleOpenPdf}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Topic/Chapter Sidebar */}
          <Sidebar
            units={unitsList}
            selectedUnit={selectedUnit}
            selectedTopic={selectedTopic}
            onSelectUnit={unit => {
              setSelectedUnit(unit);
              setSelectedTopic('all');
            }}
            onSelectTopic={(unit, topic) => {
              setSelectedUnit(unit);
              setSelectedTopic(topic);
            }}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            totalQuestionsCount={allQuestionsList.length}
          />

          {/* Practice Content Area */}
          <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-5 space-y-4">
            <div className="max-w-4xl mx-auto space-y-4">
              
              {/* Filter & Search Control Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3.5">
                
                {/* Active Unit / Topic Breadcrumb */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 flex-wrap">
                    <span className="font-semibold text-slate-800">Syllabus Scope:</span>
                    <button
                      onClick={() => { setSelectedUnit('all'); setSelectedTopic('all'); }}
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      {selectedUnit === 'all' ? 'All Units' : selectedUnit}
                    </button>
                    {selectedTopic !== 'all' && (
                      <>
                        <span className="text-slate-400">/</span>
                        <span className="font-medium text-slate-900 bg-indigo-50 px-2 py-0.5 rounded-md text-indigo-700">
                          {selectedTopic}
                        </span>
                      </>
                    )}
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-slate-500 font-semibold">
                      {filteredQuestions.length} questions
                    </span>
                  </div>

                  {/* View mode toggle (Single Focus vs List) */}
                  <div className="flex items-center gap-2">
                    {/* Font size picker */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs text-slate-600">
                      <button
                        onClick={() => setFontSize('sm')}
                        className={`px-2 py-0.5 rounded font-mono ${fontSize === 'sm' ? 'bg-white shadow-2xs text-indigo-600 font-bold' : ''}`}
                        title="Small font"
                      >
                        A-
                      </button>
                      <button
                        onClick={() => setFontSize('base')}
                        className={`px-2 py-0.5 rounded font-mono ${fontSize === 'base' ? 'bg-white shadow-2xs text-indigo-600 font-bold' : ''}`}
                        title="Default font"
                      >
                        A
                      </button>
                      <button
                        onClick={() => setFontSize('lg')}
                        className={`px-2 py-0.5 rounded font-mono ${fontSize === 'lg' ? 'bg-white shadow-2xs text-indigo-600 font-bold' : ''}`}
                        title="Large font"
                      >
                        A+
                      </button>
                    </div>

                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                      <button
                        onClick={() => setViewMode('single')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                          viewMode === 'single'
                            ? 'bg-white text-indigo-600 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Single Question Focus Mode"
                      >
                        <Grid className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Focus</span>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                          viewMode === 'list'
                            ? 'bg-white text-indigo-600 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="List of Questions Scroll Mode"
                      >
                        <ListFilter className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">List</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search & Year Filters */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search question keyword, formula, concept (e.g. Dijkstra, BCNF, K-map)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="p-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="all">All Exam Years</option>
                    {availableYears.map(yr => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Status Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs select-none">
                  {[
                    { id: 'all', label: 'All Questions', count: filteredQuestions.length },
                    { id: 'unattempted', label: 'Unattempted' },
                    { id: 'correct', label: 'Correct', icon: CheckCircle2, color: 'text-emerald-600' },
                    { id: 'incorrect', label: 'Incorrect', icon: XCircle, color: 'text-rose-600' },
                    { id: 'starred', label: 'Starred for Revision', icon: Star, color: 'text-amber-500' },
                  ].map(tab => {
                    const isActive = filterStatus === tab.id;
                    const IconComponent = tab.icon;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id as FilterStatus)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium shrink-0 border transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-semibold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {IconComponent && <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* No Questions Found State */}
              {filteredQuestions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">No questions match your current filters</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try changing your search query, selecting "All Questions" in the status filter, or picking another unit in the sidebar.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedUnit('all');
                      setSelectedTopic('all');
                      setSearchQuery('');
                      setFilterStatus('all');
                      setSelectedYear('all');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              ) : viewMode === 'single' ? (
                /* Single Question Focus Mode */
                <div className="space-y-4">
                  {currentQuestion && (
                    <QuestionCard
                      key={currentQuestion.id}
                      question={currentQuestion}
                      questionIndex={currentSingleIndex}
                      totalFiltered={filteredQuestions.length}
                      userAnswer={userAnswers[currentQuestion.id]}
                      onSelectOption={handleSelectOption}
                      onToggleStar={handleToggleStar}
                      onSaveNotes={handleSaveNotes}
                      onOpenPdf={handleOpenPdf}
                      fontSize={fontSize}
                    />
                  )}

                  {/* Single Mode Navigation Bar */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 flex items-center justify-between gap-3 shadow-xs">
                    <button
                      onClick={() => setCurrentSingleIndex(p => Math.max(0, p - 1))}
                      disabled={currentSingleIndex === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous (P)</span>
                    </button>

                    {/* Quick Jump Input */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span>Jump:</span>
                      <input
                        type="number"
                        min="1"
                        max={filteredQuestions.length}
                        value={currentSingleIndex + 1}
                        onChange={e => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1 && val <= filteredQuestions.length) {
                            setCurrentSingleIndex(val - 1);
                          }
                        }}
                        className="w-16 p-1 text-center font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      />
                      <span className="font-mono text-slate-400">/ {filteredQuestions.length}</span>
                    </div>

                    <button
                      onClick={() => setCurrentSingleIndex(p => Math.min(filteredQuestions.length - 1, p + 1))}
                      disabled={currentSingleIndex === filteredQuestions.length - 1}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <span>Next (N)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* List View Mode with Pagination */
                <div className="space-y-4">
                  {paginatedListQuestions.map((q, idx) => {
                    const actualIdx = (listPage - 1) * itemsPerPage + idx;
                    return (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        questionIndex={actualIdx}
                        totalFiltered={filteredQuestions.length}
                        userAnswer={userAnswers[q.id]}
                        onSelectOption={handleSelectOption}
                        onToggleStar={handleToggleStar}
                        onSaveNotes={handleSaveNotes}
                        onOpenPdf={handleOpenPdf}
                        fontSize={fontSize}
                      />
                    );
                  })}

                  {/* Pagination Bar */}
                  {totalPages > 1 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 flex items-center justify-between gap-3 shadow-xs">
                      <button
                        onClick={() => setListPage(p => Math.max(1, p - 1))}
                        disabled={listPage <= 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous Page</span>
                      </button>

                      <span className="text-xs font-mono font-medium text-slate-600">
                        Page {listPage} of {totalPages} ({filteredQuestions.length} questions)
                      </span>

                      <button
                        onClick={() => setListPage(p => Math.min(totalPages, p + 1))}
                        disabled={listPage >= totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        <span>Next Page</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </main>

        </div>
      )}

      {/* PDF Modal Viewer */}
      <PdfModal
        initialPage={pdfPage}
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
      />

      {/* Performance Analytics Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        units={unitsList}
        userAnswers={userAnswers}
        onResetProgress={handleResetProgress}
      />

    </div>
  );
}
