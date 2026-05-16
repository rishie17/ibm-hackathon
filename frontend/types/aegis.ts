export type GraphNode = {
  id: string;
  label: string;
  type: "module" | "service" | "infrastructure" | "utility" | "folder" | "hotspot" | "hardware" | "domain";
  risk: number;
  parent_id?: string | null;
  metadata: Record<string, any>;
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

export type BlastRadiusResponse = {
  root_id: string;
  impacted_nodes: string[];
  impacted_edges: string[];
  layers: Record<string, number>;
  intensity: Record<string, number>;
};

export type AnalysisResponse = {
  summary: RepositorySummary;
  graph: GraphResponse;
  debt: TechnicalDebtResponse;
  modernization: ModernizationResponse;
};

