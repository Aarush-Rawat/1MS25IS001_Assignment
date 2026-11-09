import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, FileSearch, Network, Lightbulb, ShieldCheck, Cpu } from 'lucide-react';

interface LoadingProgressProps {
  depth?: 'quick' | 'standard' | 'deep';
}

const STAGES = [
  {
    id: 1,
    title: 'Parsing Academic Document & Citations',
    desc: 'Extracting abstract, formal mathematical formulations, and baseline tables',
    icon: FileSearch,
  },
  {
    id: 2,
    title: 'Deconstructing Architectural Topology',
    desc: 'Synthesizing valid Mermaid.js flowchart mapping input, components, and output',
    icon: Network,
  },
  {
    id: 3,
    title: 'Designing CS Student Engineering Tracks',
    desc: 'Generating exactly 3 feasible, high-impact extensions for 3rd-year CS students',
    icon: Lightbulb,
  },
  {
    id: 4,
    title: 'Auditing Reproducibility Profile',
    desc: 'Assessing compute requirements, open datasets, and student hardware boundaries',
    icon: ShieldCheck,
  },
];

const RESEARCH_TIPS = [
  "Did you know? Over 60% of top ML papers can be adapted into strong portfolio projects by varying positional encodings, quantization, or loss functions.",
  "Tip for students: Focus on baseline comparisons. Demonstrating a 2x inference speedup with < 1% accuracy loss is often more impressive than trying to beat SOTA.",
  "Extracting architectural flowcharts helps isolate the exact bottleneck component you want to swap in your project.",
  "Reproducing on smaller benchmark datasets (like WikiText-2 or CIFAR-10) is the best way to validate an idea before spending compute on full-scale training."
];

export const LoadingProgress: React.FC<LoadingProgressProps> = ({ depth = 'standard' }) => {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [tipIndex, setTipIndex] = useState<number>(0);

  useEffect(() => {
    // Advance stages over realistic duration
    const intervalTime = depth === 'deep' ? 3800 : depth === 'quick' ? 2000 : 2800;
    const stageTimer = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, intervalTime);

    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % RESEARCH_TIPS.length);
    }, 4500);

    return () => {
      clearInterval(stageTimer);
      clearInterval(tipTimer);
    };
  }, [depth]);

  const progressPercent = Math.min(Math.round(((currentStage + 1) / STAGES.length) * 92), 95);

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Analyzing Paper with Gemini
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Depth: <span className="font-semibold uppercase text-sky-600 dark:text-sky-400">{depth}</span> mode
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-mono font-bold text-sky-600 dark:text-sky-400">{progressPercent}%</span>
          <p className="text-[10px] text-slate-400">processing</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500 transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stages list */}
      <div className="space-y-3 mb-6">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < currentStage;
          const isActive = idx === currentStage;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/80 shadow-xs'
                  : isDone
                  ? 'opacity-80'
                  : 'opacity-40'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : isActive ? (
                  <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                  <h4 className={`text-xs font-semibold ${isActive ? 'text-sky-950 dark:text-sky-200' : 'text-slate-800 dark:text-slate-300'}`}>
                    {stage.title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rotating Tip */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center gap-2.5">
        <Cpu className="w-4 h-4 text-indigo-500 shrink-0" />
        <p className="text-slate-600 dark:text-slate-400 italic text-[11px] leading-relaxed">
          {RESEARCH_TIPS[tipIndex]}
        </p>
      </div>
    </div>
  );
};
