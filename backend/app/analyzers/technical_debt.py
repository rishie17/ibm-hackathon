import networkx as nx

from app.models.schemas import RepositoryAnalysis, TechnicalDebtIssue, TechnicalDebtResponse


class TechnicalDebtAnalyzer:
    def analyze(self, analysis: RepositoryAnalysis, graph: nx.DiGraph) -> TechnicalDebtResponse:
        issues: list[TechnicalDebtIssue] = []
        
        # 1. Detect Cycles (High Debt)
        cycles = list(nx.simple_cycles(graph))
        for index, cycle in enumerate(cycles[:5], start=1):
            issues.append(
                TechnicalDebtIssue(
                    id=f"cycle-{index}",
                    title="Cyclic module dependency",
                    severity="high",
                    category="cycle",
                    affected_files=list(cycle),
                    recommendation="Invert dependencies or introduce a shared interface to break the loop.",
                )
            )

        # 2. Detect "God Modules" (Centrality hotspots)
        centrality = nx.degree_centrality(graph) if graph.number_of_nodes() > 0 else {}
        hotspots = sorted(centrality.items(), key=lambda x: x[1], reverse=True)
        for node, score in hotspots[:5]:
            if score > 0.3:  # Highly connected relative to graph size
                issues.append(
                    TechnicalDebtIssue(
                        id=f"god-module-{node}",
                        title="Architectural God Module",
                        severity="high" if score > 0.5 else "medium",
                        category="coupling",
                        affected_files=[node],
                        recommendation="Distribute responsibilities to reduce architectural coupling.",
                    )
                )

        # 3. Detect Oversized modules
        for file in analysis.files:
            if file.lines > 600:
                issues.append(
                    TechnicalDebtIssue(
                        id=f"oversized-{file.path}",
                        title="Oversized module hotspot",
                        severity="high" if file.lines > 1000 else "medium",
                        category="size",
                        affected_files=[file.path],
                        recommendation="Split module into smaller, focused logical units.",
                    )
                )

        # Derived Scores
        num_nodes = graph.number_of_nodes()
        num_edges = graph.number_of_edges()
        
        # Density: how many edges exist vs how many could exist
        density = nx.density(graph) * 100
        # Average degree: connectivity measure
        avg_degree = (num_edges / num_nodes) if num_nodes > 0 else 0
        
        debt_score = min(100.0, (len(issues) * 8) + (density * 2) + (avg_degree * 5))
        risk_score = min(100.0, debt_score * 1.1 + (len(cycles) * 10))
        modernization_readiness = max(0.0, 100.0 - (debt_score * 0.7) - (len(cycles) * 5))

        return TechnicalDebtResponse(
            debt_score=round(debt_score, 1),
            risk_score=round(risk_score, 1),
            modernization_readiness=round(modernization_readiness, 1),
            issues=issues,
        )

