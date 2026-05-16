import networkx as nx

from app.models.schemas import GraphEdge, GraphNode, GraphResponse, RepositoryAnalysis


class DependencyGraphBuilder:
    def build(self, analysis: RepositoryAnalysis) -> tuple[nx.DiGraph, GraphResponse]:
        graph = nx.DiGraph()

        domains = set()

        for file in analysis.files:
            risk = self._node_risk(file.lines, len(file.imports) + len(file.instantiations))
            
            # Determine cluster (domain) based on the top-level directory
            parts = file.path.split("/")
            parent_id = None
            if len(parts) > 1:
                domain_name = parts[0]
                parent_id = f"domain-{domain_name}"
                domains.add(parent_id)
                
            graph.add_node(file.path, label=file.path.split("/")[-1], risk=risk, file=file, parent_id=parent_id)

        for dependency in analysis.dependencies:
            graph.add_edge(
                dependency.source,
                dependency.target,
                relationship=dependency.relationship,
                weight=dependency.weight,
            )

        # Compute graph-wide metrics
        centrality = nx.degree_centrality(graph) if graph.number_of_nodes() > 0 else {}
        
        # Calculate hierarchy levels (Topological Sort / Longest Path approximation)
        levels = {}
        try:
            for i, generation in enumerate(nx.topological_generations(graph)):
                for node in generation:
                    levels[node] = i
        except nx.NetworkXUnfeasible:
            levels = {node: 0 for node in graph.nodes}

        nodes = []
        for d in domains:
            domain_label = d.replace("domain-", "").title()
            # Add to graph so it exists for traversals (even if no edges)
            graph.add_node(d, label=domain_label, type="domain", risk=0.0, file=None)
            nodes.append(
                GraphNode(
                    id=d,
                    label=domain_label,
                    type="domain",
                    risk=0.0,
                    metadata={}
                )
            )

        for node, data in graph.nodes(data=True):
            if data.get("file") is None:
                continue # Skip any nodes that are not files (just in case)
                
            node_type = self._determine_node_type(node, data, graph)
            file_data = data["file"]
            nodes.append(
                GraphNode(
                    id=node,
                    label=data["label"],
                    type=node_type,
                    risk=round(data["risk"], 2),
                    parent_id=data.get("parent_id"),
                    metadata={
                        "lines": file_data.lines,
                        "imports": len(file_data.imports),
                        "instantiations": len(file_data.instantiations),
                        "language": file_data.language,
                        "centrality": round(centrality.get(node, 0), 3),
                        "in_degree": graph.in_degree(node),
                        "out_degree": graph.out_degree(node),
                        "hierarchy_level": levels.get(node, 0),
                        "classes": len(file_data.classes),
                        "functions": len(file_data.functions)
                    },
                )
            )

        response = GraphResponse(
            nodes=nodes,
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

    def _determine_node_type(self, path: str, data: dict, graph: nx.DiGraph) -> str:
        path_lower = path.lower()
        file_lang = data["file"].language
        
        if file_lang in ("verilog", "systemverilog"):
            return "hardware"
            
        if data["risk"] >= 0.8:
            return "hotspot"
            
        if any(term in path_lower for term in ["api", "service", "route", "controller"]):
            return "service"
            
        if any(term in path_lower for term in ["util", "helper", "common", "shared"]):
            return "utility"
            
        if any(term in path_lower for term in ["db", "storage", "graph", "client", "infra"]):
            return "infrastructure"
            
        # Fallback based on connectivity
        if graph.in_degree(path) > 5:
            return "service"
            
        return "module"

    def _node_risk(self, lines: int, imports: int) -> float:
        size_pressure = min(lines / 500, 1.0)
        coupling_pressure = min(imports / 12, 1.0)
        return (size_pressure * 0.55) + (coupling_pressure * 0.45)

