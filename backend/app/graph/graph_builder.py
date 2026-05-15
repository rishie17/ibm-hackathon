import networkx as nx

from app.models.schemas import GraphEdge, GraphNode, GraphResponse, RepositoryAnalysis


class DependencyGraphBuilder:
    def build(self, analysis: RepositoryAnalysis) -> tuple[nx.DiGraph, GraphResponse]:
        graph = nx.DiGraph()

        for file in analysis.files:
            risk = self._node_risk(file.lines, len(file.imports))
            graph.add_node(file.path, label=file.path.split("/")[-1], risk=risk, file=file)

        for dependency in analysis.dependencies:
            graph.add_edge(
                dependency.source,
                dependency.target,
                relationship=dependency.relationship,
                weight=dependency.weight,
            )

        response = GraphResponse(
            nodes=[
                GraphNode(
                    id=node,
                    label=data["label"],
                    type="hotspot" if data["risk"] >= 0.75 else "module",
                    risk=round(data["risk"], 2),
                    metadata={
                        "lines": data["file"].lines,
                        "imports": len(data["file"].imports),
                        "language": data["file"].language,
                    },
                )
                for node, data in graph.nodes(data=True)
            ],
            edges=[
                GraphEdge(
                    id=f"{source}->{target}",
                    source=source,
                    target=target,
                    label=data.get("relationship", "imports"),
                    weight=data.get("weight", 1),
                )
                for source, target, data in graph.edges(data=True)
            ],
        )
        return graph, response

    def _node_risk(self, lines: int, imports: int) -> float:
        size_pressure = min(lines / 500, 1.0)
        coupling_pressure = min(imports / 12, 1.0)
        return (size_pressure * 0.55) + (coupling_pressure * 0.45)

