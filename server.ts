import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing with 50MB limit to handle uploaded academic PDFs
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side initialization of Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Robust JSON extraction helper in case Gemini wraps response in markdown code blocks
 */
function cleanAndParseJSON(rawText: string) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

/**
 * ArXiv helper to fetch paper metadata or PDF
 */
async function fetchArxivMetadata(arxivId: string) {
  try {
    const cleanId = arxivId.replace(/^v\d+$/, '').trim();
    const apiUrl = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(cleanId)}`;
    const response = await fetch(apiUrl, { headers: { 'User-Agent': 'ResearchArchitectAI/1.0' } });
    if (!response.ok) return null;
    const xml = await response.text();
    
    // Extract title
    const titleMatch = xml.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/);
    const summaryMatch = xml.match(/<entry>[\s\S]*?<summary>([\s\S]*?)<\/summary>/);
    const publishedMatch = xml.match(/<entry>[\s\S]*?<published>([\s\S]*?)<\/published>/);
    const authorMatches = [...xml.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/g)].map(m => m[1].trim());

    if (titleMatch && summaryMatch) {
      return {
        title: titleMatch[1].replace(/\s+/g, ' ').trim(),
        summary: summaryMatch[1].replace(/\s+/g, ' ').trim(),
        published: publishedMatch ? publishedMatch[1].slice(0, 4) : 'Not specified',
        authors: authorMatches,
        arxivId: cleanId,
      };
    }
  } catch (err) {
    console.warn('Error fetching arXiv metadata:', err);
  }
  return null;
}

/**
 * Download PDF from URL if it points to a PDF
 */
async function fetchPdfBufferFromUrl(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ResearchArchitect/1.0' },
    });
    clearTimeout(timeout);
    
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/pdf') || url.endsWith('.pdf')) {
      const arrayBuffer = await res.arrayBuffer();
      // Cap at 18MB for safe inline Gemini transfer
      if (arrayBuffer.byteLength > 18 * 1024 * 1024) return null;
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return { base64, mimeType: 'application/pdf' };
    }
  } catch (e) {
    console.warn('PDF fetch warning:', e);
  }
  return null;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

/**
 * 1. Analyze Paper
 */
app.post('/api/analyze-paper', async (req: Request, res: Response) => {
  try {
    const { url, pdfBase64, paperText, depth = 'standard' } = req.body;

    if (!url && !pdfBase64 && !paperText) {
      return res.status(400).json({ error: 'Please provide a paper URL, upload a PDF, or paste paper text.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const depthInstruction =
      depth === 'deep'
        ? 'Conduct an exhaustive, deep technical analysis covering fine architectural mechanics, formal mathematical definitions, and comprehensive ablation details.'
        : depth === 'quick'
        ? 'Provide a concise, high-level structural breakdown focused on main concepts and immediate feasibility for quick scanning.'
        : 'Provide a balanced, thorough academic and engineering analysis with solid mathematical and architectural grounding.';

    const systemPrompt = `You are Research Architect AI, an expert computer science research scientist and faculty advisor helping university CS students deconstruct academic papers and engineer them into viable, high-impact projects.

CRITICAL INSTRUCTIONS:
1. Grounding: Rely strictly on factual details from the paper. Never fabricate empirical numbers, claims, or citations. If a detail (like code URL, exact hardware, batch size, dataset availability) is missing, write exactly "Not specified in the paper".
2. Distinction: Clearly distinguish paper facts from student extensions.
3. Summary: The main summary MUST be under 300 words, direct and dense with technical insight.
4. Mermaid Diagram: Output a valid Mermaid.js 'graph TD' diagram.
   - Flow: Input/Data -> Preprocessing -> Model Layers/Components -> Algorithms -> Training/Inference -> Output.
   - MUST wrap all node labels in double quotes inside brackets, like:
     NodeA["Input: Tokenized Sequence (Batch, Seq_Len)"] --> NodeB["LayerNorm & Positional Encoding"]
   - Do NOT use unescaped parenthesis or quotes in node labels.
   - Use meaningful subgraph clusters where helpful.
5. Student Opportunities: Generate EXACTLY 3 realistic, high-impact projects for a 3rd-year CS student.
   - Each project must have: Project title, Exact extension, Technical motivation, Target metric, Baseline, Expected trade-off, Tech stack (list), Difficulty (Beginner/Intermediate/Advanced), Experiment, Final deliverable.
   - The projects must be achievable on consumer/student hardware (e.g. single GPU or Colab) in 4-6 weeks.
6. Reproducibility: Dataset, dataset availability ('Open Source'|'Restricted'|'Proprietary'|'Synthetic'|'Not specified'), Code availability, Framework, Hardware, Evaluation metrics, Training requirements, Difficulty ('Low'|'Medium'|'High'|'Extreme'), paperFactsNotes.

Return ONLY a single valid JSON object with this exact shape:
{
  "coreConcepts": {
    "title": "string",
    "authors": ["string"],
    "year": "number or string",
    "venueOrSource": "string",
    "summary": "string under 300 words",
    "problemStatement": "string",
    "motivation": "string",
    "methodology": "string",
    "keyAlgorithms": [
      {
        "name": "string",
        "mathConcept": "formal equation or mathematical formula",
        "explanation": "string"
      }
    ],
    "mainContributions": ["string"],
    "reportedResults": [
      {
        "metric": "string",
        "score": "string",
        "context": "string",
        "paperFact": true
      }
    ]
  },
  "architecture": {
    "mermaidCode": "graph TD\\n  ...valid quoted nodes...",
    "explanation": "string explaining the topology",
    "stages": [
      {
        "stage": "Input/Data",
        "component": "string",
        "details": "string"
      },
      {
        "stage": "Preprocessing",
        "component": "string",
        "details": "string"
      },
      {
        "stage": "Model Layers",
        "component": "string",
        "details": "string"
      },
      {
        "stage": "Algorithms",
        "component": "string",
        "details": "string"
      },
      {
        "stage": "Training/Inference",
        "component": "string",
        "details": "string"
      },
      {
        "stage": "Output",
        "component": "string",
        "details": "string"
      }
    ]
  },
  "studentOpportunities": [
    {
      "id": "opp-1",
      "title": "string",
      "exactExtension": "string",
      "technicalMotivation": "string",
      "targetMetric": "string",
      "baseline": "string",
      "expectedTradeoff": "string",
      "techStack": ["string"],
      "difficulty": "Beginner|Intermediate|Advanced",
      "experiment": "string",
      "finalDeliverable": "string"
    },
    {
      "id": "opp-2", ...
    },
    {
      "id": "opp-3", ...
    }
  ],
  "reproducibility": {
    "dataset": "string",
    "datasetAvailability": "Open Source|Restricted|Proprietary|Synthetic|Not specified",
    "codeAvailability": "string",
    "codeUrl": "optional URL or null",
    "framework": "string",
    "hardware": "string",
    "evaluationMetrics": ["string"],
    "trainingRequirements": "string",
    "difficulty": "Low|Medium|High|Extreme",
    "paperFactsNotes": "string distinguishing paper facts from student reproduction scope"
  }
}`;

    // Prepare contents payload
    const parts: any[] = [];

    // Case 1: PDF Base64 uploaded by user
    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: cleanBase64,
        },
      });
      parts.push({
        text: `${depthInstruction}\nAnalyze this uploaded research paper PDF thoroughly and generate the requested JSON schema.`,
      });
    }
    // Case 2: URL provided
    else if (url) {
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        if (/^[0-9]{4}\.[0-9]{4,5}(v[0-9]+)?$/.test(normalizedUrl)) {
          normalizedUrl = `https://arxiv.org/abs/${normalizedUrl}`;
        } else {
          normalizedUrl = `https://${normalizedUrl}`;
        }
      }

      let arxivData: any = null;
      const arxivMatch = normalizedUrl.match(/arxiv\.org\/(abs|pdf)\/([0-9]+\.[0-9]+|[a-zA-Z-]+\/[0-9]+)/);
      
      if (arxivMatch) {
        const arxivId = arxivMatch[2].replace('.pdf', '');
        arxivData = await fetchArxivMetadata(arxivId);
      }

      // Try downloading PDF directly if URL ends in .pdf or is arXiv PDF
      let pdfBuffer = null;
      if (normalizedUrl.includes('.pdf') || arxivMatch) {
        const targetPdfUrl = arxivMatch ? `https://arxiv.org/pdf/${arxivMatch[2].replace('.pdf', '')}.pdf` : normalizedUrl;
        pdfBuffer = await fetchPdfBufferFromUrl(targetPdfUrl);
      }

      if (pdfBuffer) {
        parts.push({
          inlineData: {
            mimeType: pdfBuffer.mimeType,
            data: pdfBuffer.base64,
          },
        });
        parts.push({
          text: `${depthInstruction}\nHere is the paper downloaded from ${url}. ${
            arxivData ? `Title: ${arxivData.title}. Authors: ${arxivData.authors.join(', ')}.` : ''
          }\nAnalyze this paper and return the JSON structure according to instructions.`,
        });
      } else {
        // Fallback to text prompt with arXiv details or general URL
        let contextText = `Research Paper URL: ${url}\n`;
        if (arxivData) {
          contextText += `ArXiv ID: ${arxivData.arxivId}\nTitle: ${arxivData.title}\nAuthors: ${arxivData.authors.join(', ')}\nPublished: ${arxivData.published}\nAbstract: ${arxivData.summary}\n`;
        }
        parts.push({
          text: `${depthInstruction}\nAnalyze the research paper specified by this information:\n${contextText}\nRetrieve all factual knowledge and mathematical architecture about this paper and return the requested JSON structure.`,
        });
      }
    }
    // Case 3: Raw paper text pasted
    else if (paperText) {
      parts.push({
        text: `${depthInstruction}\nAnalyze the following research paper text / abstract / excerpts:\n\n${paperText}\n\nReturn the requested JSON structure according to all instructions.`,
      });
    }

    // Call Gemini API server-side
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2, // low temperature for high factual accuracy
      },
    });

    const outputText = response.text || '';
    const parsedData = cleanAndParseJSON(outputText);

    // Build unique ID and analysis object
    const analysis = {
      id: 'paper-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      sourceType: pdfBase64 ? 'pdf' : url ? 'url' : 'text',
      sourceName: url || (req.body.fileName ? req.body.fileName : 'Pasted Academic Text'),
      depth,
      ...parsedData,
    };

    return res.json(analysis);
  } catch (error: any) {
    console.error('Paper analysis failed:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze paper. Please check the URL or PDF format and try again.',
    });
  }
});

/**
 * 2. Generate Project Blueprint ("Turn This Paper Into a Project")
 */
app.post('/api/generate-project', async (req: Request, res: Response) => {
  try {
    const { paperTitle, methodology, selectedOpportunity, customGoals } = req.body;

    if (!paperTitle) {
      return res.status(400).json({ error: 'Paper title is required to generate a project blueprint.' });
    }

    const systemPrompt = `You are a Senior CS Faculty Mentor and Principal AI Engineer. Your job is to create a complete, publication-ready, portfolio-grade project blueprint for a 3rd-year undergraduate CS student based on a research paper.

The project blueprint must be realistic, challenging yet feasible on consumer hardware (e.g. single 8GB-12GB GPU or free Google Colab / Kaggle) within 4 to 6 weeks.

Include:
- Research Question: Focused, empirically testable hypothesis.
- Baseline: Specific open-source model or reference implementation.
- Proposed Modification: Precise algorithmic or architectural change.
- Hypothesis: Quantifiable expectation.
- Dataset & Tools: Readily available datasets and libraries.
- Implementation Steps: Exactly 4 progressive milestones with actionable sub-tasks and concrete deliverables.
- Evaluation Plan: Metrics, baseline comparison methodology, validation strategy.
- 4 to 6 Week Timeline: Detailed weekly focus with concrete tasks.
- Expected Challenges: 2-3 realistic engineering/theoretical pitfalls with actionable solutions.
- GitHub Deliverable: Suggested repo name, clean folder tree, and README highlights.
- Resume Bullet: 1-2 bullet points written in the Google 'Accomplished [X] as measured by [Y], by doing [Z]' format, using strong technical action verbs.

Return ONLY a valid JSON object matching this exact shape:
{
  "title": "string",
  "researchQuestion": "string",
  "baseline": "string",
  "proposedModification": "string",
  "hypothesis": "string",
  "datasetAndTools": {
    "datasets": ["string"],
    "toolsAndLibraries": ["string"]
  },
  "implementationSteps": [
    {
      "stepNumber": 1,
      "title": "string",
      "tasks": ["string"],
      "deliverable": "string"
    }
  ],
  "evaluationPlan": {
    "metrics": ["string"],
    "baselineComparison": "string",
    "validationStrategy": "string"
  },
  "timelineWeeks": [
    {
      "week": "Week 1",
      "focus": "string",
      "tasks": ["string"]
    }
  ],
  "expectedChallenges": [
    {
      "challenge": "string",
      "solution": "string"
    }
  ],
  "gitHubDeliverable": {
    "repoName": "string",
    "directoryStructure": "string (formatted ascii tree)",
    "readmeHighlights": "string"
  },
  "resumeBullet": "string"
}`;

    const promptText = `Paper Title: ${paperTitle}
Methodology: ${methodology || 'Not specified'}
Selected Student Opportunity / Track: ${selectedOpportunity ? JSON.stringify(selectedOpportunity) : 'General architectural adaptation'}
Custom Student Preferences: ${customGoals || 'Aim for a strong balance between empirical rigor and reproducible GitHub portfolio demonstration.'}

Generate a comprehensive Project Blueprint in valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = cleanAndParseJSON(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Project generation failed:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate project blueprint.' });
  }
});

/**
 * 3. Compare Papers (Factual differences without ranking)
 */
app.post('/api/compare-papers', async (req: Request, res: Response) => {
  try {
    const { paperA, paperB } = req.body;

    if (!paperA || !paperB) {
      return res.status(400).json({ error: 'Both paperA and paperB are required for comparison.' });
    }

    const systemPrompt = `You are an academic researcher conducting a neutral, objective comparative analysis between two computer science research papers.

STRICT RULE:
Do NOT rank papers. Do NOT declare one paper "better" or a "winner". Present only factual, architectural, empirical, and computational trade-offs.

Return ONLY a valid JSON object matching this structure:
{
  "paperA": {
    "title": "string",
    "year": "string or number",
    "problemStatement": "string",
    "methodology": "string",
    "keyAlgorithms": "string",
    "dataset": "string",
    "hardware": "string",
    "resultsSummary": "string",
    "reproducibilityDifficulty": "string"
  },
  "paperB": {
    "title": "string",
    "year": "string or number",
    "problemStatement": "string",
    "methodology": "string",
    "keyAlgorithms": "string",
    "dataset": "string",
    "hardware": "string",
    "resultsSummary": "string",
    "reproducibilityDifficulty": "string"
  },
  "comparisonPoints": [
    {
      "dimension": "e.g., Problem Scope & Setting | Core Algorithmic Paradigm | Compute & Hardware Demands | Theoretical Guarantees vs Heuristics | Student Reproducibility",
      "paperAObservation": "string",
      "paperBObservation": "string",
      "factualTradeoff": "string"
    }
  ]
}`;

    const promptText = `Paper A:
Title: ${paperA.coreConcepts?.title || paperA.title}
Methodology: ${paperA.coreConcepts?.methodology || paperA.methodology}
Key Algorithms: ${JSON.stringify(paperA.coreConcepts?.keyAlgorithms || paperA.keyAlgorithms || [])}
Reproducibility: ${JSON.stringify(paperA.reproducibility || {})}
Reported Results: ${JSON.stringify(paperA.coreConcepts?.reportedResults || paperA.reportedResults || [])}

Paper B:
Title: ${paperB.coreConcepts?.title || paperB.title}
Methodology: ${paperB.coreConcepts?.methodology || paperB.methodology}
Key Algorithms: ${JSON.stringify(paperB.coreConcepts?.keyAlgorithms || paperB.keyAlgorithms || [])}
Reproducibility: ${JSON.stringify(paperB.reproducibility || {})}
Reported Results: ${JSON.stringify(paperB.coreConcepts?.reportedResults || paperB.reportedResults || [])}

Generate a strictly factual, neutral comparison matrix in valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = cleanAndParseJSON(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Paper comparison failed:', error);
    return res.status(500).json({ error: error.message || 'Failed to compare papers.' });
  }
});

// -------------------------------------------------------------
// Vite Dev vs Production Handling
// -------------------------------------------------------------
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Research Architect AI server running on http://localhost:${PORT}`);
  });
}

setupServer().catch(err => {
  console.error('Server startup error:', err);
});
