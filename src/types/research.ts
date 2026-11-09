export type AnalysisDepth = 'quick' | 'standard' | 'deep';

export interface KeyAlgorithm {
  name: string;
  mathConcept: string;
  explanation: string;
}

export interface ReportedResult {
  metric: string;
  score: string;
  context: string;
  paperFact: boolean;
}

export interface CoreConcepts {
  title: string;
  authors: string[];
  year: string | number;
  venueOrSource: string;
  summary: string; // Under 300 words
  problemStatement: string;
  motivation: string;
  methodology: string;
  keyAlgorithms: KeyAlgorithm[];
  mainContributions: string[];
  reportedResults: ReportedResult[];
}

export interface ArchitectureTopology {
  mermaidCode: string;
  explanation: string;
  stages: Array<{
    stage: 'Input/Data' | 'Preprocessing' | 'Model Layers' | 'Algorithms' | 'Training/Inference' | 'Output';
    component: string;
    details: string;
  }>;
}

export interface StudentOpportunity {
  id: string;
  title: string;
  exactExtension: string;
  technicalMotivation: string;
  targetMetric: string;
  baseline: string;
  expectedTradeoff: string;
  techStack: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  experiment: string;
  finalDeliverable: string;
}

export interface Reproducibility {
  dataset: string;
  datasetAvailability: 'Open Source' | 'Restricted' | 'Proprietary' | 'Synthetic' | 'Not specified';
  codeAvailability: string;
  codeUrl?: string;
  framework: string;
  hardware: string;
  evaluationMetrics: string[];
  trainingRequirements: string;
  difficulty: 'Low' | 'Medium' | 'High' | 'Extreme';
  paperFactsNotes: string;
}

export interface ProjectBlueprint {
  title: string;
  researchQuestion: string;
  baseline: string;
  proposedModification: string;
  hypothesis: string;
  datasetAndTools: {
    datasets: string[];
    toolsAndLibraries: string[];
  };
  implementationSteps: Array<{
    stepNumber: number;
    title: string;
    tasks: string[];
    deliverable: string;
  }>;
  evaluationPlan: {
    metrics: string[];
    baselineComparison: string;
    validationStrategy: string;
  };
  timelineWeeks: Array<{
    week: string;
    focus: string;
    tasks: string[];
  }>;
  expectedChallenges: Array<{
    challenge: string;
    solution: string;
  }>;
  gitHubDeliverable: {
    repoName: string;
    directoryStructure: string;
    readmeHighlights: string;
  };
  resumeBullet: string;
}

export interface PaperAnalysis {
  id: string;
  timestamp: number;
  sourceType: 'url' | 'pdf' | 'sample';
  sourceName: string;
  depth: AnalysisDepth;
  coreConcepts: CoreConcepts;
  architecture: ArchitectureTopology;
  studentOpportunities: [StudentOpportunity, StudentOpportunity, StudentOpportunity]; // exactly 3
  reproducibility: Reproducibility;
  projectBlueprint?: ProjectBlueprint;
  isFavorite?: boolean;
}

export interface ComparisonMatrix {
  paperA: {
    title: string;
    year: string | number;
    problemStatement: string;
    methodology: string;
    keyAlgorithms: string;
    dataset: string;
    hardware: string;
    resultsSummary: string;
    reproducibilityDifficulty: string;
  };
  paperB: {
    title: string;
    year: string | number;
    problemStatement: string;
    methodology: string;
    keyAlgorithms: string;
    dataset: string;
    hardware: string;
    resultsSummary: string;
    reproducibilityDifficulty: string;
  };
  comparisonPoints: Array<{
    dimension: string;
    paperAObservation: string;
    paperBObservation: string;
    factualTradeoff: string;
  }>;
}
