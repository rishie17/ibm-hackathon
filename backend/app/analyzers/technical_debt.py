import networkx as nx

from app.models.schemas import RepositoryAnalysis, TechnicalDebtIssue, TechnicalDebtResponse


class TechnicalDebtAnalyzer:
    def analyze(self, analysis: RepositoryAnalysis, graph: nx.DiGraph) -> TechnicalDebtResponse:
        issues: list[TechnicalDebtIssue] = []
        issues.extend(self._cycle_issues(graph))
        issues.extend(self._oversized_module_issues(analysis))
        issues.extend(self._coupling_issues(graph))

        debt_score = min(100.0, len(issues) * 12 + graph.number_of_edges() * 0.8)
        risk_score = min(100.0, debt_score * 0.85 + len(self._cycle_issues(graph)) * 10)
        modernization_readiness = max(0.0, 100.0 - (debt_score * 0.65))

        return TechnicalDebtResponse(
            debt_score=round(debt_score, 1),
            risk_score=round(risk_score, 1),
            modernization_readiness=round(modernization_readiness, 1),
            issues=issues,
        )

    def _cycle_issues(self, graph: nx.DiGraph) -> list[TechnicalDebtIssue]:
        issues: list[TechnicalDebtIssue] = []
        for index, cycle in enumerate(nx.simple_cycles(graph), start=1):
            issues.append(
                TechnicalDebtIssue(
                    id=f"cycle-{index}",
                    title="Cyclic module dependency detected",
                    severity="high",
                    category="cycle",
                    affected_files=list(cycle),
                    recommendation="Introduce a shared boundary or invert the dependency through an interface layer.",
                )
            )
        return issues[:5]

    def _oversized_module_issues(self, analysis: RepositoryAnalysis) -> list[TechnicalDebtIssue]:
        issues: list[TechnicalDebtIssue] = []
        for file in analysis.files:
            if file.lines >= 450:
                issues.append(
                    TechnicalDebtIssue(
                        id=f"oversized-{file.path}",
                        title="Oversized module hotspot",
                        severity="medium" if file.lines < 800 else "high",
                        category="size",
                        affected_files=[file.path],
                        recommendation="Split orchestration, data access, and domain logic into smaller modules.",
                    )
                )
        return issues[:8]

    def _coupling_issues(self, graph: nx.DiGraph) -> list[TechnicalDebtIssue]:
        issues: list[TechnicalDebtIssue] = []
        for node in graph.nodes:
            degree = graph.in_degree(node) + graph.out_degree(node)
            if degree >= 8:
                issues.append(
                    TechnicalDebtIssue(
                        id=f"coupling-{node}",
                        title="Tightly coupled module",
                        severity="medium" if degree < 14 else "high",
                        category="coupling",
                        affected_files=[node],
                        recommendation="Create clearer package boundaries and reduce direct imports.",
                    )
                )
        return issues[:8]

