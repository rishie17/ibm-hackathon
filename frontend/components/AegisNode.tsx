"use client";

import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";
import { Activity, Box, Cpu, Database, FileCode2, Layers, Microchip, Zap } from "lucide-react";

type AegisNodeData = {
  label: string;
  type: "module" | "service" | "infrastructure" | "utility" | "hotspot" | "hardware";
  metadata: {
    language: string;
    lines: number;
    centrality?: number;
    in_degree?: number;
    out_degree?: number;
  };
  isBlastRadius?: boolean;
  intensity?: number;
};

const TYPE_CONFIG = {
  service: { icon: Activity, color: "text-blue-400", label: "Service Layer", border: "border-blue-500/20" },
  infrastructure: { icon: Database, color: "text-purple-400", label: "Infrastructure", border: "border-purple-500/20" },
  utility: { icon: Box, color: "text-slate-400", label: "Utility Module", border: "border-slate-500/20" },
  hotspot: { icon: Cpu, color: "text-rose-400", label: "Critical Hotspot", border: "border-rose-500/30" },
  hardware: { icon: Microchip, color: "text-emerald-400", label: "Hardware Module", border: "border-emerald-500/20" },
  module: { icon: Layers, color: "text-slate-300", label: "System Module", border: "border-white/5" }
};

export function AegisNode({ data, selected }: { data: AegisNodeData; selected: boolean }) {
  const config = TYPE_CONFIG[data.type] || TYPE_CONFIG.module;
  const Icon = config.icon;
  const intensity = data.intensity ?? 0;
  
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
      className={`relative px-4 py-3 rounded-md min-w-[220px] border transition-all duration-300 bg-slate-900/80 backdrop-blur-md ${
        selected 
          ? "border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.1)]" 
          : data.isBlastRadius
          ? `border-amber-500/${Math.max(20, Math.floor(intensity * 100))}`
          : config.border
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${config.color}`} />
          <span className="text-[10px] font-medium tracking-wide text-slate-400">
            {config.label}
          </span>
        </div>
        {data.metadata.centrality !== undefined && data.metadata.centrality > 0.1 && (
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm bg-slate-800 border border-slate-700">
            <Zap className="h-2.5 w-2.5 text-amber-500/80" />
            <span className="text-[9px] font-mono text-slate-300">CORE</span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className={`text-sm font-semibold tracking-tight truncate ${selected ? "text-amber-400" : "text-slate-100"}`}>
          {data.label}
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <div className="text-[10px] font-mono text-slate-500">
            {data.metadata.lines.toLocaleString()} LOC
          </div>
          <div className="text-[9px] font-mono text-slate-500">
            IN:{data.metadata.in_degree} OUT:{data.metadata.out_degree}
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="!bg-slate-500 !border-slate-800 !w-2 !h-2 !rounded-full" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !border-slate-800 !w-2 !h-2 !rounded-full" />
    </motion.div>
  );
}
