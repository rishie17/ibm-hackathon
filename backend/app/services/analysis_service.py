from collections import Counter

import networkx as nx

from app.analyzers.technical_debt import TechnicalDebtAnalyzer
from app.graph.graph_builder import DependencyGraphBuilder
from app.models.schemas import (
    AnalysisResponse,
    AnalyzeRepositoryRequest,
    BlastRadiusResponse,
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

    def compute_blast_radius(self, node_id: str, depth: int = 3) -> BlastRadiusResponse:
        if node_id not in self._graph:
            return BlastRadiusResponse(
                root_id=node_id, impacted_nodes=[], impacted_edges=[], layers={}, intensity={}
            )

        # Transitive dependencies (successors in the graph)
        # We use BFS to capture layers
        impacted_nodes = {node_id}
        impacted_edges = []
        layers = {node_id: 0}
        intensity = {node_id: 1.0}

        queue = [(node_id, 0)]
        visited = {node_id}

        while queue:
            current, d = queue.pop(0)
            if d >= depth:
                continue

            for successor in self._graph.successors(current):
                edge_id = f"{current}->{successor}"
                impacted_edges.append(edge_id)
                
                if successor not in visited:
                    visited.add(successor)
                    impacted_nodes.add(successor)
                    layers[successor] = d + 1
                    # Intensity decays with distance
                    intensity[successor] = round(1.0 / (d + 2), 2)
                    queue.append((successor, d + 1))

        return BlastRadiusResponse(
            root_id=node_id,
            impacted_nodes=list(impacted_nodes),
            impacted_edges=impacted_edges,
            layers=layers,
            intensity=intensity,
        )

    def trace_flow(self, query: str) -> TraceResponse:
        if self._analysis is None or self._graph.number_of_nodes() == 0:
            return TraceResponse(
                query=query,
                summary="Analyze a repository before tracing flows.",
                steps=[],
                impacted_files=[],
            )

        # 1. Find the most relevant "entry point" node based on query
        # We still use a bit of keyword matching to find the START node
        terms = {term.lower() for term in query.replace("_", " ").split() if len(term) > 2}
        best_node = None
        max_score = -1
        
        for node in self._graph.nodes:
            score = sum(1 for term in terms if term in node.lower())
            if score > max_score:
                max_score = score
                best_node = node

        if not best_node or max_score == 0:
            return TraceResponse(
                query=query,
                summary="No matching entry point found. Try a specific module or feature name.",
                steps=[],
                impacted_files=[],
            )

        # 2. Trace deterministic dependency chain
        # Show what this module depends on (downstream) and what depends on it (upstream)
        upstream = list(self._graph.predecessors(best_node))[:3]
        downstream = list(self._graph.successors(best_node))[:3]
        
        steps = []
        
        # Upstream (Consumers)
        for u in upstream:
            steps.append(TraceStep(
                file=u,
                reason=f"Consumer of {best_node.split('/')[-1]} - likely part of the orchestrating flow.",
                related_imports=[]
            ))
            
        # The Anchor
        steps.append(TraceStep(
            file=best_node,
            reason=f"Primary matching entry point for '{query}'.",
            related_imports=self._graph.nodes[best_node]["file"].imports[:5]
        ))
        
        # Downstream (Dependencies)
        for d in downstream:
            steps.append(TraceStep(
                file=d,
                reason=f"Dependency of {best_node.split('/')[-1]} - provides lower-level implementation.",
                related_imports=[]
            ))

        impacted = {best_node, *upstream, *downstream}
        
        return TraceResponse(
            query=query,
            summary=f"Reconstructed dependency chain centered around {best_node.split('/')[-1]}.",
            steps=steps,
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

