import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, Download, ZoomIn, ZoomOut, RotateCcw, Code, Eye, Maximize2, Minimize2, AlertCircle, RefreshCw } from 'lucide-react';

interface MermaidRendererProps {
  code: string;
  isDarkMode?: boolean;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code, isDarkMode = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'diagram' | 'code'>('diagram');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sanitizes common LLM Mermaid formatting quirks
  const sanitizeMermaidCode = (raw: string): string => {
    let clean = raw.trim();
    // Remove markdown codeblock backticks if present
    if (clean.startsWith('```mermaid')) {
      clean = clean.replace(/^```mermaid\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Ensure it starts with graph TD or flowchart TD
    if (!clean.startsWith('graph') && !clean.startsWith('flowchart')) {
      clean = 'graph TD\n' + clean;
    }

    return clean;
  };

  const renderDiagram = async () => {
    if (!code) return;
    setHasError(false);
    setErrorMessage('');

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: isDarkMode ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        themeVariables: isDarkMode
          ? {
              darkMode: true,
              background: '#0f172a',
              primaryColor: '#38bdf8',
              primaryTextColor: '#f8fafc',
              primaryBorderColor: '#0284c7',
              lineColor: '#94a3b8',
              secondaryColor: '#818cf8',
              tertiaryColor: '#1e293b',
            }
          : {
              darkMode: false,
              background: '#ffffff',
              primaryColor: '#0284c7',
              primaryTextColor: '#0f172a',
              primaryBorderColor: '#0369a1',
              lineColor: '#64748b',
              secondaryColor: '#6366f1',
              tertiaryColor: '#f1f5f9',
            },
      });

      const uniqueId = `mermaid-graph-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const cleanCode = sanitizeMermaidCode(code);
      const { svg } = await mermaid.render(uniqueId, cleanCode);
      setSvgContent(svg);
    } catch (err: any) {
      console.warn('Mermaid render issue:', err);
      setHasError(true);
      setErrorMessage(err?.message || 'Diagram syntax could not be rendered automatically.');
    }
  };

  useEffect(() => {
    renderDiagram();
  }, [code, isDarkMode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(sanitizeMermaidCode(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy code', e);
    }
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `architecture-diagram-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    if (!svgContent) return;
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const URLObject = window.URL || window.webkitURL || window;
    const blobURL = URLObject.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // high-dpi
      canvas.width = (image.width || 1200) * scale;
      canvas.height = (image.height || 800) * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = isDarkMode ? '#0f172a' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `architecture-diagram-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      URLObject.revokeObjectURL(blobURL);
    };

    image.src = blobURL;
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.4), 2.5));
  };

  return (
    <div
      className={`relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-sm overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-white dark:bg-slate-900' : 'w-full'
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interactive Flowchart (Mermaid.js)</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center rounded-lg bg-slate-200 dark:bg-slate-700 p-0.5">
            <button
              onClick={() => setViewMode('diagram')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'diagram'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Diagram</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'code'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Mermaid Source</span>
            </button>
          </div>

          {viewMode === 'diagram' && (
            <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-700/80 rounded-lg p-0.5">
              <button
                onClick={() => handleZoom(0.15)}
                title="Zoom In"
                className="p-1 rounded text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom(-0.15)}
                title="Zoom Out"
                className="p-1 rounded text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                title="Reset Zoom"
                className="p-1 rounded text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action buttons */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
            title="Copy Mermaid Syntax"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadSVG}
            disabled={!svgContent || hasError}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            title="Download Vector SVG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>SVG</span>
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={!svgContent || hasError}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            title="Download PNG Graphic"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Diagram'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`p-4 flex-1 flex items-center justify-center min-h-[380px] overflow-auto ${isFullscreen ? 'max-h-[calc(100vh-120px)]' : 'max-h-[560px]'}`}>
        {viewMode === 'code' ? (
          <div className="w-full h-full">
            <pre className="p-4 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs overflow-auto h-full border border-slate-800 leading-relaxed">
              <code>{sanitizeMermaidCode(code)}</code>
            </pre>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center text-center p-6 max-w-md">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Diagram Rendering Notice</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{errorMessage}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={renderDiagram}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Render</span>
              </button>
              <button
                onClick={() => setViewMode('code')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Inspect Source Code</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            className="w-full flex items-center justify-center transition-transform duration-150 py-2 select-none [&_svg]:max-w-full [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
};
