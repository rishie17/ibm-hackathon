from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field


SupportedLanguage = Literal["python", "javascript", "typescript", "unknown"]


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
    functions: list[str] = Field(default_factory=list)


class DependencyEdge(BaseModel):
    source: str
    target: str
    relationship: Literal["imports", "references", "inferred"] = "imports"
    weight: int = 1


class GraphNode(BaseModel):
    id: str
    label: str
    type: Literal["module", "service", "folder", "hotspot"] = "module"
    risk: float = 0.0
    metadata: dict[str, str | int | float] = Field(default_factory=dict)


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


class AnalysisResponse(BaseModel):
    summary: RepositorySummary
    graph: GraphResponse
    debt: TechnicalDebtResponse
    modernization: ModernizationResponse


class RepositoryAnalysis(BaseModel):
    root: Path
    files: list[FileNode]
    dependencies: list[DependencyEdge]

