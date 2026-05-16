from pathlib import Path
from typing import Any, Literal

from pydantic import BaseModel, Field


SupportedLanguage = Literal["python", "javascript", "typescript", "verilog", "systemverilog", "unknown"]
RelationshipType = Literal["imports", "instantiates", "calls", "owns", "references", "inherits", "routes_to", "inferred"]


class AnalyzeRepositoryRequest(BaseModel):
    path: str = Field(..., description="Absolute or relative local repository path.")


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Natural language architecture question.")


class FileNode(BaseModel):
    path: str
    language: SupportedLanguage
    size_bytes: int
    lines: int
    imports: list[str] = Field(default_factory=list)
    exports: list[str] = Field(default_factory=list)
    classes: list[str] = Field(default_factory=list)
    functions: list[str] = Field(default_factory=list)
    instantiations: list[str] = Field(default_factory=list)
    module_defs: list[str] = Field(default_factory=list)


class DependencyEdge(BaseModel):
    source: str
    target: str
    relationship: RelationshipType = "imports"
    weight: int = 1
    metadata: dict[str, Any] = Field(default_factory=dict)


class GraphNode(BaseModel):
    id: str
    label: str
    type: str = "module"
    category: str = ""
    ownership: str = ""
    level: int = 0
    risk: float = 0.0
    parent_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str = "imports"
    weight: int = 1


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class RepositorySummary(BaseModel):
    root: str
    files_analyzed: int
    languages: dict[str, int]
    total_lines: int
    top_hotspots: list[str]


class TechnicalDebtIssue(BaseModel):
    id: str
    title: str
    severity: Literal["low", "medium", "high", "critical"]
    category: Literal["coupling", "complexity", "size", "cycle", "modernization"]
    affected_files: list[str]
    recommendation: str


class TechnicalDebtResponse(BaseModel):
    debt_score: float
    risk_score: float
    modernization_readiness: float
    issues: list[TechnicalDebtIssue]


class ModernizationSuggestion(BaseModel):
    id: str
    title: str
    rationale: str
    impact: Literal["low", "medium", "high"]
    effort: Literal["small", "medium", "large"]
    target_files: list[str]


class ModernizationResponse(BaseModel):
    suggestions: list[ModernizationSuggestion]
    roadmap: list[str]


class TraceStep(BaseModel):
    file: str
    reason: str
    related_imports: list[str] = Field(default_factory=list)


class TraceResponse(BaseModel):
    query: str
    summary: str
    steps: list[TraceStep]
    impacted_files: list[str]


class BlastRadiusResponse(BaseModel):
    root_id: str
    impacted_nodes: list[str]
    impacted_edges: list[str]
    layers: dict[str, int]  # nodeId -> distance from root
    intensity: dict[str, float]  # nodeId -> impact score


class AnalysisResponse(BaseModel):
    summary: RepositorySummary
    graph: GraphResponse
    debt: TechnicalDebtResponse
    modernization: ModernizationResponse


class RepositoryAnalysis(BaseModel):
    root: Path
    files: list[FileNode]
    dependencies: list[DependencyEdge]

