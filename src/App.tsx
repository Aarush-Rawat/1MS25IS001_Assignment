import React, { useState, useEffect } from 'react';
import { PaperAnalysis, AnalysisDepth, StudentOpportunity, ProjectBlueprint } from './types/research';
import { SAMPLE_PAPERS } from './data/samplePapers';
import { Header } from './components/Header';
import { AnalysisInputBar } from './components/AnalysisInputBar';
import { ResearchWorkflowSteps } from './components/ResearchWorkflowSteps';
import { LoadingProgress } from './components/LoadingProgress';
import { TabOverview } from './components/TabOverview';
import { TabArchitecture } from './components/TabArchitecture';
import { TabStudentProjects } from './components/TabStudentProjects';
import { TabReproducibility } from './components/TabReproducibility';
import { ProjectBlueprintModal } from './components/ProjectBlueprintModal';
import { ComparisonModal } from './components/ComparisonModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { BookOpen, Network, Lightbulb, ShieldCheck, AlertCircle, Sparkles, Terminal, FileCode2, Layers, Cpu, ArrowUpRight } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'research_architect_history';
const LOCAL_STORAGE_THEME = 'research_architect_theme';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_THEME);
    if (saved) return saved === 'dark';
    return true; // Default to dark for a high-tech CS research feel
  });

  // History state
  const [history, setHistory] = useState<PaperAnalysis[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
    return SAMPLE_PAPERS;
  });

  // Active paper
  const [activePaper, setActivePaper] = useState<PaperAnalysis | null>(() => {
    return SAMPLE_PAPERS[0] || null;
  });

  // Current tab
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'studentProjects' | 'reproducibility'>('overview');

  // Loading & Error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingDepth, setLoadingDepth] = useState<AnalysisDepth>('standard');
  const [analysisError, setAnalysisError] = useState<string>('');

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState<boolean>(false);
  const [blueprintTargetOpp, setBlueprintTargetOpp] = useState<StudentOpportunity | undefined>(undefined);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState<boolean>(false);

  // Sync theme to <html> class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_THEME, 'light');
    }
  }, [isDarkMode]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [history]);

  // Handle Analysis submission
  const handleAnalyzePaper = async (payload: {
    url?: string;
    pdfBase64?: string;
    fileName?: string;
    paperText?: string;
    depth: AnalysisDepth;
  }) => {
    setIsLoading(true);
    setLoadingDepth(payload.depth);
    setAnalysisError('');

    try {
      const response = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze paper. Please check inputs and try again.');
      }

      const analyzedData: PaperAnalysis = await response.json();
      
      // Update state
      setActivePaper(analyzedData);
      setHistory((prev) => {
        const exists = prev.find((p) => p.id === analyzedData.id);
        if (exists) return prev;
        return [analyzedData, ...prev];
      });
      setActiveTab('overview');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'An unexpected error occurred during paper analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sample Selection
  const handleSelectSample = (sampleId: string) => {
    const found = SAMPLE_PAPERS.find((s) => s.id === sampleId) || history.find((h) => h.id === sampleId);
    if (found) {
      setActivePaper(found);
      setActiveTab('overview');
      setAnalysisError('');
    }
  };

  // Open Blueprint Modal for opportunity
  const handleOpenBlueprintModal = (opportunity?: StudentOpportunity) => {
    setBlueprintTargetOpp(opportunity);
    setIsBlueprintModalOpen(true);
  };

  // Generate Blueprint via API
  const handleGenerateBlueprint = async (customGoals: string) => {
    if (!activePaper) return;
    setIsGeneratingBlueprint(true);

    try {
      const response = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperTitle: activePaper.coreConcepts.title,
          methodology: activePaper.coreConcepts.methodology,
          selectedOpportunity: blueprintTargetOpp || activePaper.studentOpportunities[0],
          customGoals,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate blueprint.');
      }

      const blueprint: ProjectBlueprint = await response.json();
      
      // Update current active paper with blueprint
      const updatedPaper = { ...activePaper, projectBlueprint: blueprint };
      setActivePaper(updatedPaper);
      setHistory((prev) => prev.map((p) => (p.id === updatedPaper.id ? updatedPaper : p)));
    } catch (err: any) {
      console.error('Blueprint generation error:', err);
      alert(err.message || 'Failed to generate blueprint.');
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  // History operations
  const handleDeletePaper = (paperId: string) => {
    setHistory((prev) => prev.filter((p) => p.id !== paperId));
    if (activePaper?.id === paperId) {
      setActivePaper(history[1] || null);
    }
  };

  const handleToggleFavorite = (paperId: string) => {
    setHistory((prev) =>
      prev.map((p) => (p.id === paperId ? { ...p, isFavorite: !p.isFavorite } : p))
    );
    if (activePaper?.id === paperId) {
      setActivePaper((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : prev));
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your saved research history?')) {
      setHistory(SAMPLE_PAPERS);
      setActivePaper(SAMPLE_PAPERS[0] || null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        activePaper={activePaper}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onSelectSample={handleSelectSample}
        samples={SAMPLE_PAPERS}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        
        {/* Modern Research Platform Hero Section */}
        <section className="relative text-center pt-2 sm:pt-6 pb-2 max-w-4xl mx-auto space-y-4">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl pointer-events-none rounded-full -z-10" />

          {/* Hero Header: Pill badge as requested */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-cyan-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-[11px] tracking-wide">v2.0 • Powered by Gemini 1.5 Pro</span>
          </div>

          {/* Gradient heading as requested */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] text-balance">
            <span className="bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 dark:from-white dark:via-indigo-200 dark:to-cyan-200 bg-clip-text text-transparent">
              Transform Research Papers into
            </span>{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 dark:from-indigo-400 dark:via-cyan-300 dark:to-sky-300 bg-clip-text text-transparent">
              Runnable Code Projects
            </span>
          </h1>

          {/* Subtext targeted at CS students */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed text-balance">
            Bridge the gap between theoretical computer science breakthroughs and practical implementations. Deconstruct dense arXiv manuscripts into interactive Mermaid.js architecture flowcharts, evaluate reproducibility barriers, and turn complex papers into stellar portfolio projects for 3rd-year CS students.
          </p>

          {/* Trust & Capability Ribbon */}
          <div className="pt-1 flex items-center justify-center gap-3 sm:gap-6 flex-wrap text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span> Factual Gemini Grounding
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-indigo-500 font-bold">✓</span> Interactive Mermaid.js Topologies
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-cyan-500 font-bold">✓</span> 3rd-Year CS Feasibility Scoping
            </span>
          </div>
        </section>

        {/* 3-Step Process Section (Directly Below Hero) */}
        <section className="max-w-4xl mx-auto">
          <ResearchWorkflowSteps />
        </section>

        {/* Input Zone: Segmented Switcher, Drag-and-Drop (Max 20MB), Selectable Depth Cards, Quick-Start Samples */}
        <section className="max-w-4xl mx-auto">
          <AnalysisInputBar
            onAnalyze={handleAnalyzePaper}
            isLoading={isLoading}
            onSelectSample={handleSelectSample}
            samples={SAMPLE_PAPERS}
          />
        </section>

        {/* Loading Progress UI */}
        {isLoading && <LoadingProgress depth={loadingDepth} />}

        {/* Error Alert */}
        {analysisError && !isLoading && (
          <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold mb-1">Analysis Notice</h4>
              <p className="leading-relaxed">{analysisError}</p>
            </div>
            <button
              onClick={() => setAnalysisError('')}
              className="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Active Paper Dashboard */}
        {activePaper && !isLoading && (
          <section className="space-y-6 pt-2">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto gap-4">
              <nav className="flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>1. Core Concepts</span>
                </button>

                <button
                  onClick={() => setActiveTab('architecture')}
                  className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'architecture'
                      ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  <span>2. Architecture Flowchart</span>
                </button>

                <button
                  onClick={() => setActiveTab('studentProjects')}
                  className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'studentProjects'
                      ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>3. Student Opportunities</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    3
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('reproducibility')}
                  className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'reproducibility'
                      ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>4. Reproducibility & Feasibility</span>
                </button>
              </nav>

              {/* Turn into project shortcut button */}
              <div className="hidden sm:block shrink-0">
                <button
                  onClick={() => handleOpenBlueprintModal()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-indigo-700 to-sky-700 hover:from-indigo-600 hover:to-sky-600 dark:from-indigo-600 dark:to-cyan-600 dark:hover:from-indigo-500 dark:hover:to-cyan-500 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Turn Paper into Project</span>
                </button>
              </div>
            </div>

            {/* Tab Views */}
            <div className="transition-opacity duration-200">
              {activeTab === 'overview' && (
                <TabOverview coreConcepts={activePaper.coreConcepts} />
              )}

              {activeTab === 'architecture' && (
                <TabArchitecture
                  architecture={activePaper.architecture}
                  isDarkMode={isDarkMode}
                />
              )}

              {activeTab === 'studentProjects' && (
                <TabStudentProjects
                  opportunities={activePaper.studentOpportunities}
                  onOpenProjectGenerator={handleOpenBlueprintModal}
                  paperTitle={activePaper.coreConcepts.title}
                />
              )}

              {activeTab === 'reproducibility' && (
                <TabReproducibility reproducibility={activePaper.reproducibility} />
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/90 dark:border-slate-800/90 bg-white/60 dark:bg-[#070b14]/80 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Research Architect AI
            </span>
            <span>·</span>
            <span>Empowering Computer Science Students with Academic Rigor</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Powered by Gemini 3.8 & Mermaid.js</span>
            <span>·</span>
            <span>Factual Academic Grounding</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProjectBlueprintModal
        isOpen={isBlueprintModalOpen}
        onClose={() => setIsBlueprintModalOpen(false)}
        blueprint={activePaper?.projectBlueprint}
        opportunity={blueprintTargetOpp}
        paperTitle={activePaper?.coreConcepts.title || ''}
        onGenerateBlueprint={handleGenerateBlueprint}
        isGenerating={isGeneratingBlueprint}
      />

      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        historyPapers={history}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectPaper={(paper) => {
          setActivePaper(paper);
          setActiveTab('overview');
        }}
        onDeletePaper={handleDeletePaper}
        onToggleFavorite={handleToggleFavorite}
        onClearAll={handleClearHistory}
      />
    </div>
  );
}
