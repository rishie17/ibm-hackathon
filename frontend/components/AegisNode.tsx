"use client";

import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";
import { Cpu, FileCode2, Layers } from "lucide-react";

type AegisNodeData = {
  label: string;
  type: "module" | "hotspot";
  metadata: {
    language: string;
    lines: number;
  };
  isBlastRadius?: boolean;
  isSource?: boolean;
};

export function AegisNode({ data, selected }: { data: AegisNodeData; selected: boolean }) {
  const isHotspot = data.type === "hotspot";
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      className={`relative px-4 py-3 rounded-sm min-w-[200px] border transition-all duration-500 ${
        selected 
          ? "glass-panel-strong border-warning/50 shadow-[0_0_20px_rgba(248,184,78,0.2)]" 
          : data.isBlastRadius
          ? "glass-panel border-warning/30 shadow-[0_0_15px_rgba(248,184,78,0.1)]"
          : isHotspot
          ? "glass-panel border-danger/40"
          : "glass-panel border-white/10"
      }`}
    >
      {/* Selection Glow */}
      {selected && (
        <motion.div
          layoutId="glow"
          className="absolute inset-0 rounded-sm bg-warning/5 blur-xl -z-10"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Pulse for Hotspots */}
      {isHotspot && !selected && (
        <motion.div
          className="absolute inset-0 rounded-sm border border-danger/30 -z-10"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {isHotspot ? (
            <Cpu className="h-3.5 w-3.5 text-danger" />
          ) : (
            <Layers className="h-3.5 w-3.5 text-teal-400" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {isHotspot ? "Critical Hotspot" : "System Module"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
          <FileCode2 className="h-3 w-3 text-slate-400" />
          <span className="text-[9px] font-mono text-slate-400 uppercase">{data.metadata.language}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className={`text-sm font-bold tracking-tight truncate ${selected ? "text-warning" : "text-white"}`}>
          {data.label}
        </div>
        <div className="mt-1 text-[10px] font-mono text-slate-500">
          SIZE: {data.metadata.lines.toLocaleString()} LOC
        </div>
      </div>

      {/* Decorative dots */}
      <div className="absolute bottom-1 right-1 flex gap-0.5">
        <div className={`h-0.5 w-0.5 rounded-full ${selected ? "bg-warning" : "bg-slate-700"}`} />
        <div className={`h-0.5 w-0.5 rounded-full ${selected ? "bg-warning/50" : "bg-slate-800"}`} />
      </div>

      <Handle type="target" position={Position.Top} className="!bg-slate-700 !border-none !w-2 !h-1 !rounded-none" />
      <Handle type="source" position={Position.Bottom} className="!bg-teal-500 !border-none !w-2 !h-1 !rounded-none shadow-[0_0_5px_var(--accent)]" />
    </motion.div>
  );
}
