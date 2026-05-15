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

  return (
    <>
      {/* Background glow for selected/animated edges */}
      {(selected || animated) && (
        <path
          id={`${id}-glow`}
          style={{
            ...style,
            strokeWidth: selected ? 6 : 4,
            stroke: selected ? "var(--warning)" : "var(--accent)",
            opacity: 0.15,
            filter: "blur(4px)"
          }}
          className="react-flow__edge-path"
          d={edgePath}
          fill="none"
        />
      )}
      
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          stroke: selected ? "var(--warning)" : animated ? "var(--accent)" : "var(--line)",
          strokeWidth: selected ? 2.5 : animated ? 2 : 1.5,
          transition: "stroke 0.3s, stroke-width 0.3s"
        }} 
      />
      
      {/* Animated particle flow */}
      {(animated || selected) && (
        <circle r="2" fill={selected ? "var(--warning)" : "var(--accent)"}>
          <animateMotion
            dur={selected ? "1.5s" : "3s"}
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}
    </>
  );
}
