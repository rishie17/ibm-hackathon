from collections import Counter

import networkx as nx

from app.analyzers.technical_debt import TechnicalDebtAnalyzer
from app.graph.graph_builder import DependencyGraphBuilder
from app.models.schemas import (
    AnalysisResponse,
    AnalyzeRepositoryRequest,
    GraphResponse,
    ModernizationResponse,
    RepositoryAnalysis,
    RepositorySummary,
    TechnicalDebtResponse,
    TraceResponse,
    TraceStep,
)
from app.modernization.analyzer import ModernizationAnalyzer
from app.parsers.repository_parser import RepositoryParser


class AnalysisService:
    def __init__(self) -> None:
        self.parser = RepositoryParser()
        self.graph_builder = DependencyGraphBuilder()
        self.debt_analyzer = TechnicalDebtAnalyzer()
        self.modernization_analyzer = ModernizationAnalyzer()
        self._analysis: RepositoryAnalysis | None = None
        self._graph: nx.DiGraph = nx.DiGraph()
        self._graph_response = GraphResponse(nodes=[], edges=[])
        self._debt = TechnicalDebtResponse(
            debt_score=0,
            risk_score=0,
            modernization_readiness=100,
            issues=[],
        )
        self._modernization = ModernizationResponse(suggestions=[], roadmap=[])

    def analyze_repository(self, payload: AnalyzeRepositoryRequest) -> AnalysisResponse:
        analysis = self.parser.parse(payload.path)
        graph, graph_response = self.graph_builder.build(analysis)
        debt = self.debt_analyzer.analyze(analysis, graph)
        modernization = self.modernization_analyzer.analyze(analysis, graph, debt)

        self._analysis = analysis
        self._graph = graph
        self._graph_response = graph_response
        self._debt = debt
        self._modernization = modernization

        return AnalysisResponse(
            summary=self._summary(analysis, graph),
            graph=graph_response,
            debt=debt,
            modernization=modernization,
        )

    def get_graph(self) -> GraphResponse:
        return self._graph_response

    def get_technical_debt(self) -> TechnicalDebtResponse:
        return self._debt

    def get_modernization(self) -> ModernizationResponse:
        return self._modernization

    def trace_flow(self, query: str) -> TraceResponse:
        if self._analysis is None:
            return TraceResponse(
                query=query,
                summary="Analyze a repository before tracing flows.",
                steps=[],
                impacted_files=[],
            )

        terms = {term.lower() for term in query.replace("_", " ").split() if len(term) > 2}
        ranked = []
        for file in self._analysis.files:
            haystack = " ".join([file.path, *file.imports, *file.functions]).lower()
            score = sum(1 for term in terms if term in haystack)
            if score:
                ranked.append((score, file))

        ranked.sort(key=lambda item: (item[0], item[1].lines), reverse=True)
        selected = [file for _, file in ranked[:6]]

        impacted = set(file.path for file in selected)
        for file in selected:
            impacted.update(self._graph.successors(file.path))
            impacted.update(self._graph.predecessors(file.path))

        # TODO(IBM Bob): replace keyword ranking with Bob full-context flow reasoning.
        return TraceResponse(
            query=query,
            summary=(
                f"Found {len(selected)} likely flow entry points using file names, imports, and functions."
                if selected
                else "No direct matches found. Try querying a feature, module, or function name from the repository."
            ),
            steps=[
                TraceStep(
                    file=file.path,
                    reason="Matched query terms against module path, imports, or function names.",
                    related_imports=file.imports[:8],
                )
                for file in selected
            ],
            impacted_files=sorted(impacted),
        )

    def _summary(self, analysis: RepositoryAnalysis, graph: nx.DiGraph) -> RepositorySummary:
        languages = Counter(file.language for file in analysis.files)
        top_hotspots = sorted(
            analysis.files,
            key=lambda file: (graph.degree(file.path), file.lines),
            reverse=True,
        )[:5]
        return RepositorySummary(
            root=str(analysis.root),
            files_analyzed=len(analysis.files),
            languages=dict(languages),
            total_lines=sum(file.lines for file in analysis.files),
            top_hotspots=[file.path for file in top_hotspots],
        )

