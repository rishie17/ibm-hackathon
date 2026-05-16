"use client";

import { fetchBlastRadius } from "@/lib/api";
import dagre from "dagre";
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

import { AegisDomain } from "@/components/AegisDomain";
import { AegisEdge } from "@/components/AegisEdge";
import { AegisNode } from "@/components/AegisNode";
import type { GraphResponse } from "@/types/aegis";

type DependencyGraphProps = {
  graph: GraphResponse;
  highlightedFiles: string[];
};

const nodeTypes = {
  aegisNode: AegisNode,
  aegisDomain: AegisDomain
};

const edgeTypes = {
  aegisEdge: AegisEdge
};

const NODE_WIDTH = 280;
const NODE_HEIGHT = 120;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph({ compound: true });
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // Extreme spacing for cinematic rhythm
  dagreGraph.setGraph({ rankdir: direction, ranksep: 240, nodesep: 140 });

  nodes.forEach((node) => {
    if (node.type === "aegisDomain") {
      dagreGraph.setNode(node.id, { label: node.data.label });
    } else {
      dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
      if (node.parentNode) {
        dagreGraph.setParent(node.id, node.parentNode);
      }
    }
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    if (node.type === "aegisDomain") {
      return {
        ...node,
        position: { 
          x: nodeWithPosition.x - nodeWithPosition.width / 2, 
          y: nodeWithPosition.y - nodeWithPosition.height / 2 
        },
        style: { width: nodeWithPosition.width, height: nodeWithPosition.height, zIndex: -1 }
      };
    }

    let x = nodeWithPosition.x - NODE_WIDTH / 2;
    let y = nodeWithPosition.y - NODE_HEIGHT / 2;

    if (node.parentNode) {
      const parentPos = dagreGraph.node(node.parentNode);
      x -= (parentPos.x - parentPos.width / 2);
      y -= (parentPos.y - parentPos.height / 2);
    }

    return {
      ...node,
      position: { x, y }
    };
  });

  return { nodes: layoutedNodes, edges };
};

export function DependencyGraph({ graph, highlightedFiles }: DependencyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const highlighted = useMemo(() => new Set(highlightedFiles), [highlightedFiles]);

  // Initialize nodes and edges when graph data changes
  useEffect(() => {
    if (graph.nodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const initialNodes: Node[] = graph.nodes.map((node) => ({
      id: node.id,
      type: node.type === "domain" ? "aegisDomain" : "aegisNode",
      position: { x: 0, y: 0 },
      parentNode: node.parent_id || undefined,
      data: {
        label: node.label,
        type: node.type,
        metadata: node.metadata,
        risk: node.risk,
        isBlastRadius: false
      }
    }));

    const initialEdges: Edge[] = graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "aegisEdge",
      animated: false,
      data: { label: edge.label }
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [graph, setNodes, setEdges]);

  // Handle flow tracing highlighting without resetting layout
  useEffect(() => {
    if (graph.nodes.length === 0) return;

    setEdges((eds) => 
      eds.map((edge) => {
        const isHighlighted = highlighted.has(edge.source) || highlighted.has(edge.target);
        return {
          ...edge,
          animated: isHighlighted,
          style: {
            ...edge.style,
            opacity: highlighted.size > 0 && !isHighlighted ? 0.1 : 1,
            stroke: isHighlighted ? "#d97706" : undefined // amber-600 for trace
          }
        };
      })
    );

    setNodes((nds) => 
      nds.map((node) => {
        const isHighlighted = highlighted.has(node.id);
        const isDomain = node.type === "aegisDomain";
        return {
          ...node,
          style: {
            ...node.style,
            opacity: highlighted.size > 0 && !isHighlighted && !isDomain ? 0.2 : 1
          }
        };
      })
    );
  }, [highlighted, setEdges, setNodes, graph.nodes.length]);

  const onSelectionChange = useCallback(
    async ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 0) {
        // Reset blast radius
        setNodes((nds) =>
          nds.map((node) => ({
            ...node,
            data: { ...node.data, isBlastRadius: false, intensity: 1.0 },
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
      
      try {
        const blast = await fetchBlastRadius(selectedId);
        const impactedNodes = new Set(blast.impacted_nodes);
        const impactedEdges = new Set(blast.impacted_edges);

        setNodes((nds) =>
          nds.map((node) => {
            const isInRadius = impactedNodes.has(node.id);
            const intensity = blast.intensity[node.id] ?? 0;
            const isDomain = node.type === "aegisDomain";
            
            return {
              ...node,
              data: { 
                ...node.data, 
                isBlastRadius: isInRadius && node.id !== selectedId,
                intensity: intensity
              },
              style: { 
                ...node.style, 
                opacity: isInRadius || isDomain ? 1 : 0.1 
              }
            };
          })
        );

        setEdges((eds) =>
          eds.map((edge) => {
            const isInRadius = impactedEdges.has(edge.id);
            return {
              ...edge,
              selected: isInRadius,
              style: { 
                ...edge.style, 
                opacity: isInRadius ? 1 : 0.05 
              }
            };
          })
        );
      } catch (error) {
        console.error("Failed to fetch blast radius:", error);
      }
    },
    [setNodes, setEdges]
  );

  return (
    <div className="h-full w-full overflow-hidden bg-transparent relative">
      {/* Cinematic Depth Layer */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(41,37,36,0.3)_0%,transparent_100%)]" />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.02}
        maxZoom={1}
      >
        <MiniMap 
          nodeStrokeWidth={0} 
          zoomable 
          nodeColor={() => "#44403c"}
          maskColor="rgba(18, 16, 14, 0.8)"
          style={{ 
            background: "rgba(28, 25, 23, 0.4)", 
            border: "1px solid rgba(120, 113, 108, 0.1)", 
            borderRadius: "0px",
            backdropFilter: "blur(20px)"
          }}
        />
        <Controls className="!bg-stone-900/40 !border-stone-800/40 !shadow-none !rounded-none !bottom-10 !left-10" />
      </ReactFlow>
    </div>
  );
}
