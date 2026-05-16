"use client";

import { BaseEdge, EdgeProps, getBezierPath } from "@xyflow/react";

export function AegisEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  animated,
  selected
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const strokeColor = selected 
    ? "rgba(251, 191, 36, 0.7)" // amber-400
    : animated 
    ? "rgba(96, 165, 250, 0.5)" // blue-400
    : "rgba(255, 255, 255, 0.08)";

  return (
    <path
      id={id}
      style={{
        ...style,
        stroke: strokeColor,
        strokeWidth: selected ? 2 : 1.5,
        transition: "stroke 0.3s ease, stroke-width 0.3s ease",
        fill: "none"
      }}
      className={`react-flow__edge-path ${animated && !selected ? "animate-pulse" : ""}`}
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
}
