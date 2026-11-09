import React, { useState } from 'react';
import { StudentOpportunity } from '../types/research';
import { Lightbulb, Wrench, Gauge, Scale, Layers, Rocket, ShieldCheck, Sparkles, Filter, Code } from 'lucide-react';

interface TabStudentProjectsProps {
  opportunities: StudentOpportunity[];
  onOpenProjectGenerator: (opportunity?: StudentOpportunity) => void;
  paperTitle: string;
}

export const TabStudentProjects: React.FC<TabStudentProjectsProps> = ({
  opportunities,
  onOpenProjectGenerator,
  paperTitle,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const filteredOpportunities = opportunities.filter((opp) => {
    if (filterDifficulty === 'all') return true;
    return opp.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'intermediate':
        return 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'advanced':
        return 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header banner with Project Generator Trigger */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 dark:from-sky-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              CS Undergraduate Research Extensions
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Exactly 3 grounded, achievable portfolio projects calibrated for a third-year CS student using standard consumer/cloud GPU hardware.
          </p>
        </div>

        <button
          onClick={() => onOpenProjectGenerator()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-md shadow-indigo-500/20 transition-all shrink-0"
        >
          <Rocket className="w-4 h-4" />
          <span>Turn This Paper Into a Project</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Difficulty:</span>
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterDifficulty(lvl)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                  filterDifficulty === lvl
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-400 dark:text-slate-500">
          Showing {filteredOpportunities.length} of 3 extensions
        </span>
      </div>

      {/* 3 Project Opportunities Cards */}
      <div className="space-y-6">
        {filteredOpportunities.map((opp, index) => (
          <div
            key={opp.id || index}
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs hover:border-sky-300 dark:hover:border-sky-800 transition-all"
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                  0{index + 1}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {opp.title}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Target baseline: {opp.baseline}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyColor(
                    opp.difficulty
                  )}`}
                >
                  {opp.difficulty}
                </span>

                <button
                  onClick={() => onOpenProjectGenerator(opp)}
                  className="px-3 py-1 rounded-lg text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 transition-colors flex items-center gap-1.5"
                  title="Generate custom blueprint for this track"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Build Blueprint</span>
                </button>
              </div>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              {/* Exact Extension */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  <Wrench className="w-3.5 h-3.5 text-sky-500" />
                  <span>Exact Concrete Extension</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {opp.exactExtension}
                </p>
              </div>

              {/* Technical Motivation */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Technical Motivation</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {opp.technicalMotivation}
                </p>
              </div>

              {/* Target Metric vs Baseline */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Target Metric</span>
                </div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  {opp.targetMetric}
                </p>
              </div>

              {/* Expected Trade-off */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  <Scale className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Expected Empirical Trade-off</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {opp.expectedTradeoff}
                </p>
              </div>
            </div>

            {/* Experiment Step & Deliverable */}
            <div className="space-y-2.5 pt-1">
              <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/50">
                <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider block mb-1">
                  Step-by-Step Experiment:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {opp.experiment}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-2.5">
                <Rocket className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-0.5">
                    Final Deliverable:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {opp.finalDeliverable}
                  </p>
                </div>
              </div>
            </div>

            {/* Tech stack badges */}
            <div className="flex items-center gap-1.5 flex-wrap mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
                <Code className="w-3 h-3" /> Tech Stack:
              </span>
              {opp.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
