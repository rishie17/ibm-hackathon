export type GraphNode = {
  id: string;
  label: string;
  type: "module" | "service" | "folder" | "hotspot";
  risk: number;
  metadata: Record<string, string | number>;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  weight: number;
};

export type GraphResponse = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type RepositorySummary = {
  root: string;
  files_analyzed: number;
  languages: Record<string, number>;
  total_lines: number;
  top_hotspots: string[];
};

export type TechnicalDebtIssue = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  category: "coupling" | "complexity" | "size" | "cycle" | "modernization";
  affected_files: string[];
  recommendation: string;
};

export type TechnicalDebtResponse = {
  debt_score: number;
  risk_score: number;
  modernization_readiness: number;
  issues: TechnicalDebtIssue[];
};

export type ModernizationSuggestion = {
  id: string;
  title: string;
  rationale: string;
  impact: "low" | "medium" | "high";
  effort: "small" | "medium" | "large";
  target_files: string[];
};

export type ModernizationResponse = {
  suggestions: ModernizationSuggestion[];
  roadmap: string[];
};

export type TraceResponse = {
  query: string;
  summary: string;
  steps: Array<{
    file: string;
    reason: string;
    related_imports: string[];
  }>;
  impacted_files: string[];
};

export type AnalysisResponse = {
  summary: RepositorySummary;
  graph: GraphResponse;
  debt: TechnicalDebtResponse;
  modernization: ModernizationResponse;
};

