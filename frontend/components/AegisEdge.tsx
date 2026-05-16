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
    ? "#e7e5e4" // stone-200
    : animated 
    ? "#57534e" // stone-600
    : "rgba(120, 113, 108, 0.15)"; // stone-400 at low opacity

  return (
    <path
      id={id}
      style={{
        ...style,
        stroke: strokeColor,
        strokeWidth: selected ? 1.5 : 1,
        transition: "stroke 1s ease, stroke-width 1s ease",
        fill: "none",
        opacity: selected ? 1 : 0.6
      }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
}
