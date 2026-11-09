import { PaperAnalysis, ProjectBlueprint } from '../types/research';

export const exportPaperToMarkdown = (paper: PaperAnalysis): string => {
  const { coreConcepts, architecture, studentOpportunities, reproducibility, projectBlueprint } = paper;

  let md = `# Research Architect Dossier: ${coreConcepts.title}\n\n`;
  md += `**Authors**: ${coreConcepts.authors.join(', ')}\n`;
  md += `**Year / Venue**: ${coreConcepts.year} | ${coreConcepts.venueOrSource}\n`;
  md += `**Analysis Depth**: ${paper.depth.toUpperCase()}\n`;
  md += `**Dossier Generated**: ${new Date(paper.timestamp).toLocaleDateString()}\n\n`;

  md += `---\n\n## 1. Executive Summary (< 300 words)\n\n${coreConcepts.summary}\n\n`;
  md += `### Problem Statement\n${coreConcepts.problemStatement}\n\n`;
  md += `### Motivation\n${coreConcepts.motivation}\n\n`;
  md += `### Methodology\n${coreConcepts.methodology}\n\n`;

  md += `### Key Mathematical & Algorithmic Concepts\n`;
  coreConcepts.keyAlgorithms.forEach((alg, i) => {
    md += `#### ${i + 1}. ${alg.name}\n`;
    md += `- **Mathematical Formulation**: \`${alg.mathConcept}\`\n`;
    md += `- **Explanation**: ${alg.explanation}\n\n`;
  });

  md += `### Main Contributions\n`;
  coreConcepts.mainContributions.forEach((contrib) => {
    md += `- ${contrib}\n`;
  });
  md += `\n`;

  md += `### Reported Empirical Results (Paper Facts)\n`;
  coreConcepts.reportedResults.forEach((res) => {
    md += `- **${res.metric}**: **${res.score}** (${res.context}) [Verified Paper Fact: ${res.paperFact ? 'Yes' : 'Unspecified'}]\n`;
  });
  md += `\n---\n\n## 2. Architecture & Pipeline Topology\n\n`;
  md += `### Mermaid Flowchart\n\`\`\`mermaid\n${architecture.mermaidCode}\n\`\`\`\n\n`;
  md += `### Architectural Overview\n${architecture.explanation}\n\n`;
  md += `### Pipeline Stages\n`;
  architecture.stages.forEach((st) => {
    md += `- **${st.stage}** [${st.component}]: ${st.details}\n`;
  });
  md += `\n---\n\n## 3. Student Project Opportunities (CS Undergraduate)\n\n`;

  studentOpportunities.forEach((opp, i) => {
    md += `### Project ${i + 1}: ${opp.title} [Difficulty: ${opp.difficulty}]\n`;
    md += `- **Exact Extension**: ${opp.exactExtension}\n`;
    md += `- **Technical Motivation**: ${opp.technicalMotivation}\n`;
    md += `- **Target Metric**: ${opp.targetMetric}\n`;
    md += `- **Baseline Model**: ${opp.baseline}\n`;
    md += `- **Expected Trade-off**: ${opp.expectedTradeoff}\n`;
    md += `- **Tech Stack**: ${opp.techStack.join(', ')}\n`;
    md += `- **Experiment Plan**: ${opp.experiment}\n`;
    md += `- **Final Deliverable**: ${opp.finalDeliverable}\n\n`;
  });

  md += `---\n\n## 4. Reproducibility & Feasibility Assessment\n\n`;
  md += `- **Dataset**: ${reproducibility.dataset}\n`;
  md += `- **Dataset Availability**: ${reproducibility.datasetAvailability}\n`;
  md += `- **Code Availability**: ${reproducibility.codeAvailability} ${reproducibility.codeUrl ? `([Link](${reproducibility.codeUrl}))` : ''}\n`;
  md += `- **Framework**: ${reproducibility.framework}\n`;
  md += `- **Hardware Requirements**: ${reproducibility.hardware}\n`;
  md += `- **Training Requirements**: ${reproducibility.trainingRequirements}\n`;
  md += `- **Evaluation Metrics**: ${reproducibility.evaluationMetrics.join(', ')}\n`;
  md += `- **Reproducibility Difficulty**: ${reproducibility.difficulty}\n`;
  md += `- **Paper Facts vs Student Scope**: ${reproducibility.paperFactsNotes}\n\n`;

  if (projectBlueprint) {
    md += `---\n\n## 5. Engineered Project Blueprint: ${projectBlueprint.title}\n\n`;
    md += `### Research Question\n${projectBlueprint.researchQuestion}\n\n`;
    md += `### Baseline & Modification\n`;
    md += `- **Baseline**: ${projectBlueprint.baseline}\n`;
    md += `- **Modification**: ${projectBlueprint.proposedModification}\n`;
    md += `- **Hypothesis**: ${projectBlueprint.hypothesis}\n\n`;
    md += `### Datasets & Tools\n`;
    md += `- **Datasets**: ${projectBlueprint.datasetAndTools.datasets.join(', ')}\n`;
    md += `- **Tools/Libraries**: ${projectBlueprint.datasetAndTools.toolsAndLibraries.join(', ')}\n\n`;

    md += `### 4-6 Week Implementation Plan\n`;
    projectBlueprint.timelineWeeks.forEach((tw) => {
      md += `#### ${tw.week}: ${tw.focus}\n`;
      tw.tasks.forEach((t) => (md += `  - ${t}\n`));
    });
    md += `\n### GitHub Repository Deliverable\n\`\`\`\n${projectBlueprint.gitHubDeliverable.directoryStructure}\n\`\`\`\n\n`;
    md += `### Resume Bullet Point\n> ${projectBlueprint.resumeBullet}\n\n`;
  }

  return md;
};

export const downloadTextFile = (content: string, filename: string, mimeType: string = 'text/markdown') => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
