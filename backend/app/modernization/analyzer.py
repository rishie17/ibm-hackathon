import networkx as nx

from app.models.schemas import (
    ModernizationResponse,
    ModernizationSuggestion,
    RepositoryAnalysis,
    TechnicalDebtResponse,
)


class ModernizationAnalyzer:
    def analyze(
        self,
        analysis: RepositoryAnalysis,
        graph: nx.DiGraph,
        debt: TechnicalDebtResponse,
    ) -> ModernizationResponse:
        suggestions: list[ModernizationSuggestion] = []

        hotspots = sorted(analysis.files, key=lambda file: (file.lines, len(file.imports)), reverse=True)
        for file in hotspots[:4]:
            if file.lines >= 250 or len(file.imports) >= 8:
                suggestions.append(
                    ModernizationSuggestion(
                        id=f"extract-{file.path}",
                        title=f"Extract clearer boundaries around {file.path}",
                        rationale="This module has enough size or coupling pressure to slow safe changes.",
                        impact="high" if file.lines >= 500 else "medium",
                        effort="medium",
                        target_files=[file.path],
                    )
                )

        if any(issue.category == "cycle" for issue in debt.issues):
            suggestions.append(
                ModernizationSuggestion(
                    id="break-cycles",
                    title="Break cyclic architecture dependencies",
                    rationale="Cycles make migration sequencing and impact analysis unreliable.",
                    impact="high",
                    effort="large",
                    target_files=sorted({file for issue in debt.issues for file in issue.affected_files}),
                )
            )

        if graph.number_of_nodes() > 0 and graph.number_of_edges() / graph.number_of_nodes() > 2.5:
            suggestions.append(
                ModernizationSuggestion(
                    id="package-boundaries",
                    title="Introduce explicit package ownership boundaries",
                    rationale="High edge density suggests modules are sharing implementation details directly.",
                    impact="medium",
                    effort="medium",
                    target_files=[],
                )
            )

        roadmap = [
            "Map critical flows and mark ownership for top hotspots.",
            "Break cycles before large migrations.",
            "Extract stable interfaces around high-change modules.",
            "Use IBM Bob sessions to validate modernization plans against full repository context.",
        ]

        # TODO(IBM Bob): enrich suggestions with Bob modernization plans and migration playbooks.
        return ModernizationResponse(suggestions=suggestions[:8], roadmap=roadmap)

