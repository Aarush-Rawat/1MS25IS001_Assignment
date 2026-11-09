import React, { useState, useRef } from 'react';
import { Search, Upload, FileText, Sparkles, Link as LinkIcon, ArrowRight, FileCheck, X, Compass, AlertCircle, Clipboard, Check, Zap, Target, Microscope, BookOpen } from 'lucide-react';
import { AnalysisDepth, PaperAnalysis } from '../types/research';

interface AnalysisInputBarProps {
  onAnalyze: (payload: { url?: string; pdfBase64?: string; fileName?: string; paperText?: string; depth: AnalysisDepth }) => void;
  isLoading: boolean;
  onSelectSample: (sampleId: string) => void;
  samples: PaperAnalysis[];
}

export const AnalysisInputBar: React.FC<AnalysisInputBarProps> = ({
  onAnalyze,
  isLoading,
  onSelectSample,
  samples,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'pdf' | 'text'>('url');
  const [urlInput, setUrlInput] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<{ file: File; base64: string } | null>(null);
  const [depth, setDepth] = useState<AnalysisDepth>('standard');
  const [inputError, setInputError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB exact validation

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setInputError('Invalid format. Please select a PDF file (.pdf).');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setInputError('File exceeds 20MB limit. Please upload a smaller PDF or use arXiv URL.');
      return;
    }

    setInputError('');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        file,
        base64: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setInputError('Invalid format. Only research papers in PDF format (.pdf) are accepted.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setInputError('File exceeds 20MB limit. Please upload a smaller PDF or use arXiv URL.');
        return;
      }
      setInputError('');
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile({
          file,
          base64: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrlInput(text.trim());
          setInputError('');
        }
      }
    } catch {
      // Ignore clipboard permission rejections
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError('');

    if (activeTab === 'url') {
      if (!urlInput.trim()) {
        setInputError('Please enter an arXiv, OpenReview, or PDF research paper URL.');
        return;
      }
      onAnalyze({ url: urlInput.trim(), depth });
    } else if (activeTab === 'pdf') {
      if (!selectedFile) {
        setInputError('Please select or drag-and-drop a research paper PDF (max 20MB).');
        return;
      }
      onAnalyze({
        pdfBase64: selectedFile.base64,
        fileName: selectedFile.file.name,
        depth,
      });
    } else if (activeTab === 'text') {
      if (!textInput.trim() || textInput.trim().length < 50) {
        setInputError('Please enter at least 50 characters of academic paper text or abstract.');
        return;
      }
      onAnalyze({ paperText: textInput.trim(), depth });
    }
  };

  // 3 Selectable Depth Cards configuration
  const depthCards = [
    {
      id: 'quick' as AnalysisDepth,
      icon: Zap,
      title: 'Quick',
      tag: '⚡ Fast Breakdown',
      description: 'Fast key takeaways, problem formulation & core math equations.',
      timeEst: '~5s analysis',
      color: 'hover:border-amber-500/60 dark:hover:border-amber-400/60',
      activeBorder: 'border-amber-500 bg-amber-500/5 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'standard' as AnalysisDepth,
      icon: Target,
      title: 'Standard',
      tag: '🎯 Recommended',
      description: 'End-to-end architecture flowchart + 3 realistic student projects.',
      timeEst: '~12s analysis',
      color: 'hover:border-indigo-500/60 dark:hover:border-indigo-400/60',
      activeBorder: 'border-indigo-600 dark:border-indigo-500 bg-indigo-500/5 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'deep' as AnalysisDepth,
      icon: Microscope,
      title: 'Deep',
      tag: '🔬 Exhaustive Audit',
      description: 'Full reproducibility audit, baseline comparisons & 6-week execution plan.',
      timeEst: '~20s analysis',
      color: 'hover:border-cyan-500/60 dark:hover:border-cyan-400/60',
      activeBorder: 'border-cyan-600 dark:border-cyan-400 bg-cyan-500/5 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400',
    },
  ];

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0c1222] shadow-xl shadow-slate-950/5 dark:shadow-black/60 backdrop-blur-md overflow-hidden transition-all">
        
        {/* Segmented Control Switcher: Clean Tab Toggle */}
        <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setActiveTab('url'); setInputError(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                activeTab === 'url'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Paper URL</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('pdf'); setInputError(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                activeTab === 'pdf'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {activeTab !== 'text' ? (
              <button
                type="button"
                onClick={() => { setActiveTab('text'); setInputError(''); }}
                className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Or paste manuscript text</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setActiveTab('url'); setInputError(''); }}
                className="text-[11px] font-medium text-indigo-600 dark:text-cyan-400 hover:underline"
              >
                Back to URL / PDF input
              </button>
            )}
          </div>
        </div>

        {/* Input Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
          
          {/* 1. Paper URL Input Area */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Paper URL / arXiv Link
                </label>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>arXiv · OpenReview · direct PDF URL</span>
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="flex items-center gap-1 text-indigo-600 dark:text-cyan-400 hover:underline font-semibold"
                  >
                    <Clipboard className="w-3 h-3" />
                    <span>Paste</span>
                  </button>
                </div>
              </div>

              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="e.g. https://arxiv.org/abs/1706.03762 or https://arxiv.org/pdf/2304.02643.pdf"
                  className="w-full pl-10 pr-20 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                {urlInput && (
                  <button
                    type="button"
                    onClick={() => setUrlInput('')}
                    className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                <span>Enter a full URL or short arXiv identifier like <code className="text-indigo-600 dark:text-cyan-400 font-mono">1512.03385</code></span>
                <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono border border-slate-200 dark:border-slate-700">Enter</kbd> to analyze</span>
              </div>
            </div>
          )}

          {/* 2. PDF Drag-and-Drop Area (Validated: Max 20MB, PDF Only) */}
          {activeTab === 'pdf' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Upload Paper Manuscript (PDF, Max 20MB)
                </label>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Multimodal layout & table parsing
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group ${
                    isDragOver
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50 scale-[1.005]'
                      : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50/90 dark:hover:bg-slate-950/70'
                  }`}
                >
                  <div className="w-13 h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Drop your research paper PDF here or click to browse
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center max-w-md">
                    Strictly PDF format, maximum 20MB. Parses multi-column layouts, tables, and algorithms.
                  </p>
                  <div className="flex items-center gap-2.5 mt-3 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">.pdf only</span>
                    <span>·</span>
                    <span>Max 20MB</span>
                    <span>·</span>
                    <span>Gemini Multimodal Ingestion</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl border border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/40">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-sm sm:max-w-md">
                        {selectedFile.file.name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        {(selectedFile.file.size / (1024 * 1024)).toFixed(2)} MB · Validated PDF ready for extraction
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Remove paper"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. Text Paste Fallback */}
          {activeTab === 'text' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Paste Academic Paper Abstract, Equations, or Methodology
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={4}
                placeholder="Paste the abstract, methodology section, mathematical formulations, or algorithm descriptions..."
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all leading-relaxed"
              />
            </div>
          )}

          {/* Visual Selectable Depth Cards */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                Select Analysis Depth
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Tailored for CS student research timelines
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {depthCards.map((card) => {
                const Icon = card.icon;
                const isSelected = depth === card.id;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setDepth(card.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between relative ${
                      isSelected
                        ? `${card.activeBorder} shadow-sm ring-1 ring-indigo-500/30`
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 ' + card.color
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {card.title}
                          </span>
                        </div>
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-indigo-600 dark:bg-cyan-500 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                            {card.timeEst}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                        {card.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{card.tag}</span>
                      {isSelected && <span className="text-indigo-600 dark:text-cyan-400 font-semibold">Active</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Error Callout */}
          {inputError && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{inputError}</span>
            </div>
          )}

          {/* Bottom Bar: Quick-Start Sample Buttons + Analyze Button */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Quick-Start Sample Buttons: 3 Specific Papers */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                <span>Quick-Start Sample Papers:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Attention Is All You Need (Transformer) */}
                <button
                  type="button"
                  onClick={() => onSelectSample('paper-attention-2017')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 dark:bg-slate-850 dark:hover:bg-indigo-950/60 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>"Attention Is All You Need" <span className="opacity-60 font-mono">(Transformer)</span></span>
                </button>

                {/* 2. YOLOv8 Architecture (Vision) */}
                <button
                  type="button"
                  onClick={() => onSelectSample('paper-yolov8-2023')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 dark:bg-slate-850 dark:hover:bg-indigo-950/60 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5 text-cyan-500" />
                  <span>"YOLOv8 Architecture" <span className="opacity-60 font-mono">(Vision)</span></span>
                </button>

                {/* 3. ResNet (Deep Learning) */}
                <button
                  type="button"
                  onClick={() => onSelectSample('paper-resnet-2015')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 dark:bg-slate-850 dark:hover:bg-indigo-950/60 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>"ResNet" <span className="opacity-60 font-mono">(Deep Learning)</span></span>
                </button>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-600 hover:from-indigo-600 hover:via-indigo-500 hover:to-cyan-500 shadow-lg shadow-indigo-600/25 disabled:opacity-60 transition-all duration-150 active:scale-[0.98] shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Analyzing Research Paper...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Analyze Paper</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
