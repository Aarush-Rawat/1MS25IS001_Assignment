import React, { useState } from 'react';
import { ProjectBlueprint, StudentOpportunity } from '../types/research';
import { X, Rocket, Sparkles, Check, Copy, Calendar, GitFork, Award, AlertCircle, FolderTree, Code2, Download } from 'lucide-react';
import { downloadTextFile } from '../utils/exportUtils';

interface ProjectBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprint?: ProjectBlueprint;
  opportunity?: StudentOpportunity;
  paperTitle: string;
  onGenerateBlueprint: (customGoals: string) => Promise<void>;
  isGenerating: boolean;
}

export const ProjectBlueprintModal: React.FC<ProjectBlueprintModalProps> = ({
  isOpen,
  onClose,
  blueprint,
  opportunity,
  paperTitle,
  onGenerateBlueprint,
  isGenerating,
}) => {
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedRepo, setCopiedRepo] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState('');

  if (!isOpen) return null;

  const handleCopyResumeBullet = async () => {
    if (!blueprint?.resumeBullet) return;
    try {
      await navigator.clipboard.writeText(blueprint.resumeBullet);
      setCopiedResume(true);
      setTimeout(() => setCopiedResume(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyDirectoryTree = async () => {
    if (!blueprint?.gitHubDeliverable?.directoryStructure) return;
    try {
      await navigator.clipboard.writeText(blueprint.gitHubDeliverable.directoryStructure);
      setCopiedRepo(true);
      setTimeout(() => setCopiedRepo(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadBlueprintMarkdown = () => {
    if (!blueprint) return;
    let md = `# Project Blueprint: ${blueprint.title}\n\n`;
    md += `**Based on Paper**: ${paperTitle}\n\n`;
    md += `## Research Question\n${blueprint.researchQuestion}\n\n`;
    md += `## Baseline & Modification\n- **Baseline**: ${blueprint.baseline}\n- **Proposed Modification**: ${blueprint.proposedModification}\n- **Hypothesis**: ${blueprint.hypothesis}\n\n`;
    md += `## Datasets & Tools\n- Datasets: ${blueprint.datasetAndTools.datasets.join(', ')}\n- Tools: ${blueprint.datasetAndTools.toolsAndLibraries.join(', ')}\n\n`;
    md += `## Implementation Steps\n`;
    blueprint.implementationSteps.forEach((s) => {
      md += `### Step ${s.stepNumber}: ${s.title}\n`;
      s.tasks.forEach((t) => (md += `- ${t}\n`));
      md += `**Deliverable**: ${s.deliverable}\n\n`;
    });
    md += `## 4-6 Week Timeline\n`;
    blueprint.timelineWeeks.forEach((tw) => {
      md += `### ${tw.week}: ${tw.focus}\n`;
      tw.tasks.forEach((t) => (md += `- ${t}\n`));
    });
    md += `\n## GitHub Repository Deliverable\n\`\`\`\n${blueprint.gitHubDeliverable.directoryStructure}\n\`\`\`\n\n`;
    md += `## Resume Bullet Point\n> ${blueprint.resumeBullet}\n`;

    downloadTextFile(md, `${blueprint.gitHubDeliverable?.repoName || 'project'}-blueprint.md`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Turn This Paper Into a Project
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                End-to-End CS Undergraduate Project Blueprint
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {blueprint && (
              <button
                onClick={handleDownloadBlueprintMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Download Blueprint Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Plan</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Track selector / customization prompt if not yet generated or regenerating */}
          {(!blueprint || isGenerating) && (
            <div className="p-5 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-200 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>Configure Project Scope</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {opportunity
                  ? `Selected Target Extension: ${opportunity.title}`
                  : `Paper: ${paperTitle}`}
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Custom Student Focus / Constraints (optional):
                </label>
                <input
                  type="text"
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(e.target.value)}
                  placeholder="e.g., Focus on training on a free Google Colab T4 GPU, emphasize latency benchmarking"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                onClick={() => onGenerateBlueprint(customGoalInput)}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Synthesizing 4-6 Week Project Architecture...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Generate Full Project Blueprint</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Render Blueprint when ready */}
          {blueprint && !isGenerating && (
            <div className="space-y-6">
              {/* Title & Research Question */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block mb-1">
                  Project Title
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  {blueprint.title}
                </h2>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Core Research Question:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    "{blueprint.researchQuestion}"
                  </p>
                </div>
              </div>

              {/* Baseline, Proposed Modification & Hypothesis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Baseline
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {blueprint.baseline}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-[11px] font-bold text-sky-500 uppercase tracking-wider block mb-1">
                    Proposed Modification
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {blueprint.proposedModification}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">
                    Hypothesis
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {blueprint.hypothesis}
                  </p>
                </div>
              </div>

              {/* Datasets & Tools */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                    Recommended Datasets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {blueprint.datasetAndTools.datasets.map((d, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-xs font-mono bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                    Libraries & Tools:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {blueprint.datasetAndTools.toolsAndLibraries.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-xs font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Implementation Steps */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-sky-500" />
                  <span>Implementation Milestones</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {blueprint.implementationSteps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {step.stepNumber}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            {step.title}
                          </h5>
                        </div>
                        <ul className="space-y-1 mb-3">
                          {step.tasks.map((task, ti) => (
                            <li
                              key={ti}
                              className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5"
                            >
                              <span className="text-sky-500">•</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Deliverable: {step.deliverable}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 to 6 Week Timeline */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>4 to 6 Week Project Timeline</span>
                </h4>

                <div className="space-y-3">
                  {blueprint.timelineWeeks.map((week, wi) => (
                    <div
                      key={wi}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {week.week}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-900 dark:text-slate-200">
                          {week.focus}
                        </span>
                      </div>
                      <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                        {week.tasks.map((task, ti) => (
                          <li key={ti} className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* GitHub Deliverable Repository Blueprint */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FolderTree className="w-4 h-4 text-emerald-500" />
                    <span>GitHub Deliverable Repository Structure</span>
                  </h4>
                  <button
                    onClick={handleCopyDirectoryTree}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    {copiedRepo ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRepo ? 'Copied' : 'Copy Tree'}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
                  <pre>
                    <code>{blueprint.gitHubDeliverable.directoryStructure}</code>
                  </pre>
                </div>
              </div>

              {/* Resume Bullet Point */}
              <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/80 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/40 dark:to-purple-950/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    <span>Resume Ready Bullet Point</span>
                  </div>
                  <button
                    onClick={handleCopyResumeBullet}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white"
                  >
                    {copiedResume ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedResume ? 'Copied to Clipboard' : 'Copy Bullet'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  "{blueprint.resumeBullet}"
                </div>
              </div>

              {/* Regenerate with different constraints */}
              <div className="text-center pt-2">
                <button
                  onClick={() => onGenerateBlueprint(customGoalInput || 'Refine for higher algorithmic novelty')}
                  disabled={isGenerating}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium"
                >
                  🔄 Regenerate or fine-tune blueprint
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
