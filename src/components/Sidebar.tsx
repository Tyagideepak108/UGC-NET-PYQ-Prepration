import React, { useState, useMemo } from 'react';
import { 
  FolderTree, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Layers, 
  BookMarked,
  X,
  Sparkles
} from 'lucide-react';
import { UnitInfo } from '../types';

interface SidebarProps {
  units: UnitInfo[];
  selectedUnit: string;
  selectedTopic: string;
  onSelectUnit: (unit: string) => void;
  onSelectTopic: (unit: string, topic: string) => void;
  isOpen: boolean;
  onClose: () => void;
  totalQuestionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  units,
  selectedUnit,
  selectedTopic,
  onSelectUnit,
  onSelectTopic,
  isOpen,
  onClose,
  totalQuestionsCount,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    'Algorithms': true,
    'Computer Networks': true,
    'Databases': true,
    'Operating System': true,
  });

  const toggleExpand = (unitName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedUnits(prev => ({
      ...prev,
      [unitName]: !prev[unitName]
    }));
  };

  const filteredUnits = useMemo(() => {
    if (!searchFilter.trim()) return units;
    const q = searchFilter.toLowerCase();
    return units
      .map(u => {
        const matchesUnit = u.name.toLowerCase().includes(q);
        const matchedTopics = u.topics.filter(t => t.name.toLowerCase().includes(q));
        if (matchesUnit || matchedTopics.length > 0) {
          return {
            ...u,
            topics: matchesUnit ? u.topics : matchedTopics
          };
        }
        return null;
      })
      .filter((u): u is UnitInfo => u !== null);
  }, [units, searchFilter]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
              Units & Chapters
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search inside topics/units */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search units or topics..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchFilter && (
              <button 
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* List of units and topics */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1 select-none text-xs">
          
          {/* Option: All Questions */}
          <button
            onClick={() => {
              onSelectUnit('all');
              if (window.innerWidth < 1024) onClose();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
              selectedUnit === 'all'
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="font-semibold">All UGC NET Questions</span>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              selectedUnit === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {totalQuestionsCount}
            </span>
          </button>

          <div className="pt-2 pb-1 px-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            Syllabus Units ({filteredUnits.length})
          </div>

          {/* Unit items */}
          {filteredUnits.map(unit => {
            const isUnitSelected = selectedUnit === unit.name;
            const isExpanded = expandedUnits[unit.name] || searchFilter.length > 0;
            const hasTopics = unit.topics && unit.topics.length > 0;

            return (
              <div key={unit.name} className="space-y-0.5">
                {/* Unit Header Button */}
                <div
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    isUnitSelected && selectedTopic === 'all'
                      ? 'bg-indigo-50 border border-indigo-200/80 text-indigo-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100/80'
                  }`}
                  onClick={() => {
                    onSelectUnit(unit.name);
                    setExpandedUnits(p => ({ ...p, [unit.name]: true }));
                    if (window.innerWidth < 1024 && !hasTopics) onClose();
                  }}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {hasTopics && (
                      <button
                        onClick={(e) => toggleExpand(unit.name, e)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                        aria-label={`Toggle ${unit.name} topics`}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                    <span className="truncate text-xs" title={unit.name}>
                      {unit.name}
                    </span>
                  </div>

                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-medium ${
                    isUnitSelected
                      ? 'bg-indigo-200/60 text-indigo-800'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/60'
                  }`}>
                    {unit.count}
                  </span>
                </div>

                {/* Topics / Chapters Under This Unit */}
                {hasTopics && isExpanded && (
                  <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l-2 border-slate-100 ml-3.5">
                    {/* All Topics in this unit */}
                    <button
                      onClick={() => {
                        onSelectTopic(unit.name, 'all');
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-left transition-colors ${
                        isUnitSelected && selectedTopic === 'all'
                          ? 'text-indigo-600 font-semibold bg-indigo-50/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">Entire Unit (All {unit.count})</span>
                    </button>

                    {unit.topics.map(topic => {
                      const isTopicSelected = isUnitSelected && selectedTopic === topic.name;
                      return (
                        <button
                          key={topic.name}
                          onClick={() => {
                            onSelectTopic(unit.name, topic.name);
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-left transition-colors ${
                            isTopicSelected
                              ? 'bg-indigo-600 text-white font-medium shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate text-[11px]" title={topic.name}>
                            {topic.name}
                          </span>
                          <span className={`text-[10px] ml-1 font-mono ${
                            isTopicSelected ? 'text-indigo-100' : 'text-slate-400'
                          }`}>
                            {topic.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

        </nav>

        {/* Footer info in sidebar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5 text-indigo-500" />
            <span>NTA UGC NET Exam Ready</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            Active
          </span>
        </div>
      </aside>
    </>
  );
};
