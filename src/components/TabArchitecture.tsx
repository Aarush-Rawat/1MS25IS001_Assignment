import React from 'react';
import { ArchitectureTopology } from '../types/research';
import { MermaidRenderer } from './MermaidRenderer';
import { Network, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

interface TabArchitectureProps {
  architecture: ArchitectureTopology;
  isDarkMode: boolean;
}

export const TabArchitecture: React.FC<TabArchitectureProps> = ({ architecture, isDarkMode }) => {
  return (
    <div className="space-y-6">
      {/* Top Description */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <Network className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Architecture Topology Flowchart
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {architecture.explanation}
        </p>
      </div>

      {/* Visual Mermaid Diagram */}
      <MermaidRenderer code={architecture.mermaidCode} isDarkMode={isDarkMode} />

      {/* Detailed Pipeline Stages Breakdown */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>End-to-End Pipeline Stages</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {architecture.stages.map((stage, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                    Stage {idx + 1}: {stage.stage}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 mb-1.5">
                  {stage.component}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {stage.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
