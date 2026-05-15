"use client";

import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { useMemo } from "react";

import type { GraphResponse } from "@/types/repolens";

type DependencyGraphProps = {
  graph: GraphResponse;
  highlightedFiles: string[];
};

export function DependencyGraph({ graph, highlightedFiles }: DependencyGraphProps) {
  const highlighted = useMemo(() => new Set(highlightedFiles), [highlightedFiles]);

  const nodes: Node[] = useMemo(
    () =>
      graph.nodes.map((node, index) => ({
        id: node.id,
        position: {
          x: (index % 5) * 230,
          y: Math.floor(index / 5) * 145
        },
        data: {
          label: (
            <div className="max-w-[190px]">
              <div className="truncate font-semibold">{node.label}</div>
              <div className="mt-1 text-[10px] text-slate-400">
                {node.metadata.language} · {node.metadata.lines} lines
              </div>
            </div>
          )
        },
        style: {
          borderColor: highlighted.has(node.id)
            ? "#f8b84e"
            : node.type === "hotspot"
              ? "#fb7185"
              : "rgba(79, 209, 197, 0.34)",
          background: highlighted.has(node.id) ? "#261f10" : node.type === "hotspot" ? "#22111a" : "#101723"
        }
      })),
    [graph.nodes, highlighted]
  );

  const edges: Edge[] = useMemo(
    () =>
      graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: highlighted.has(edge.source) || highlighted.has(edge.target),
        label: edge.label
      })),
    [graph.edges, highlighted]
  );

  return (
    <div className="h-[540px] overflow-hidden rounded-lg border border-slate-700/70 bg-slate-950/50">
      <ReactFlow nodes={nodes} edges={edges} fitView minZoom={0.2}>
        <Background color="#334155" gap={22} />
        <MiniMap nodeStrokeWidth={3} pannable zoomable />
        <Controls />
      </ReactFlow>
    </div>
  );
}

