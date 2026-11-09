import React from 'react';
import { FileUp, Cpu, Rocket, Terminal, CheckCircle2 } from 'lucide-react';

export const ResearchWorkflowSteps: React.FC = () => {
  const steps = [
    {
      step: '01 / Input Paper',
      subtitle: 'Manuscript Ingestion',
      description: 'Paste an arXiv/PDF URL or drop a research paper manuscript. Validates double-column scientific layouts, tables, and formula notation.',
      icon: FileUp,
      accentBorder: 'hover:border-indigo-500/50',
      badgeColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/80',
      features: ['arXiv IDs & Direct PDFs', 'Drag-and-Drop (Max 20MB)', 'Dual-column layout support'],
    },
    {
      step: '02 / AI Extraction',
      subtitle: 'Grounded Analysis',
      description: 'Gemini extracts core methodology, math, and architecture flowcharts. Strictly adheres to paper facts and flags unstated details.',
      icon: Cpu,
      accentBorder: 'hover:border-cyan-500/50',
      badgeColor: 'text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800/80',
      features: ['Interactive Mermaid.js graph', 'Formal algorithm formulations', 'Hardware & dataset audit'],
    },
    {
      step: '03 / Build Project',
      subtitle: 'Practical Implementation',
      description: 'Turn theoretical papers into practical 3rd-year CS student portfolios with 3 concrete extensions, 4–6 week roadmaps, and resume bullets.',
      icon: Rocket,
      accentBorder: 'hover:border-emerald-500/50',
      badgeColor: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80',
      features: ['3 Realistic CS projects', '4–6 Week implementation plan', 'GitHub tree & resume bullet'],
    },
  ];

  return (
    <div className="w-full my-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            Structured Workflow
          </h2>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            Three Steps from Academic Paper to Executable Code
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-indigo-500" />
          <span>Paper &rarr; Extraction &rarr; Portfolio</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`group relative p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5 ${item.accentBorder}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 group-hover:scale-105 transition-transform duration-200 border border-slate-200/80 dark:border-slate-700">
                    <Icon className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-200">
                    {item.step}
                  </span>
                </div>
                <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${item.badgeColor}`}>
                  {item.subtitle}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-[48px]">
                {item.description}
              </p>

              {/* Highlights */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                {item.features.map((feature, fi) => (
                  <div key={fi} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
