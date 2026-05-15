"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type OnSelectionChangeParams
} from "@xyflow/react";
import { useCallback, useEffect, useMemo } from "react";

import { AegisEdge } from "@/components/AegisEdge";
import { AegisNode } from "@/components/AegisNode";
import type { GraphResponse } from "@/types/aegis";

type DependencyGraphProps = {
  graph: GraphResponse;
  highlightedFiles: string[];
};

const nodeTypes = {
  aegisNode: AegisNode
};

const edgeTypes = {
  aegisEdge: AegisEdge
};

export function DependencyGraph({ graph, highlightedFiles }: DependencyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const highlighted = useMemo(() => new Set(highlightedFiles), [highlightedFiles]);

  // Initialize nodes and edges when graph data changes
  useEffect(() => {
    const newNodes: Node[] = graph.nodes.map((node, index) => ({
      id: node.id,
      type: "aegisNode",
      position: {
        x: (index % 4) * 300,
        y: Math.floor(index / 4) * 180
      },
      data: {
        label: node.label,
        type: node.type,
        metadata: node.metadata,
        isBlastRadius: false
      }
    }));

    const newEdges: Edge[] = graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "aegisEdge",
      animated: highlighted.has(edge.source) || highlighted.has(edge.target),
      data: { label: edge.label }
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [graph, highlighted, setNodes, setEdges]);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 0) {
        // Reset blast radius
        setNodes((nds) =>
          nds.map((node) => ({
            ...node,
            data: { ...node.data, isBlastRadius: false },
            style: { ...node.style, opacity: 1 }
          }))
        );
        setEdges((eds) =>
          eds.map((edge) => ({
            ...edge,
            selected: false,
            style: { ...edge.style, opacity: 1 }
          }))
        );
        return;
      }

      const selectedId = selectedNodes[0].id;
      const blastRadiusNodes = new Set<string>([selectedId]);
      const blastRadiusEdges = new Set<string>();

      // Simple one-level BFS for blast radius propagation
      // In a real app, this would be a deep traversal
      graph.edges.forEach((edge) => {
        if (edge.source === selectedId) {
          blastRadiusNodes.add(edge.target);
          blastRadiusEdges.add(edge.id);
        }
      });

      setNodes((nds) =>
        nds.map((node) => {
          const isInRadius = blastRadiusNodes.has(node.id);
          return {
            ...node,
            data: { ...node.data, isBlastRadius: isInRadius },
            style: { ...node.style, opacity: isInRadius || selectedNodes.length === 0 ? 1 : 0.3 }
          };
        })
      );

      setEdges((eds) =>
        eds.map((edge) => {
          const isInRadius = blastRadiusEdges.has(edge.id);
          return {
            ...edge,
            selected: isInRadius,
            style: { ...edge.style, opacity: isInRadius || selectedNodes.length === 0 ? 1 : 0.1 }
          };
        })
      );
    },
    [graph.edges, setNodes, setEdges]
  );

  return (
    <div className="h-[600px] overflow-hidden rounded-sm glass-panel border-white/5 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,209,197,0.05),transparent_70%)] pointer-events-none" />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background color="rgba(255,255,255,0.03)" gap={20} />
        <MiniMap 
          nodeStrokeWidth={3} 
          pannable 
          zoomable 
          nodeColor={(n) => (n.data.type === "hotspot" ? "var(--danger)" : "var(--accent)")}
          maskColor="rgba(0,0,0,0.6)"
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}
