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
  service: { icon: Activity, color: "text-stone-300", bg: "bg-stone-800/40", border: "border-stone-700/50", label: "Service" },
  infrastructure: { icon: Database, color: "text-stone-400", bg: "bg-stone-800/40", border: "border-stone-700/50", label: "Infra" },
  utility: { icon: Box, color: "text-stone-500", bg: "bg-stone-800/40", border: "border-stone-700/50", label: "Util" },
  hotspot: { icon: Cpu, color: "text-stone-200", bg: "bg-stone-800/60", border: "border-stone-600/50", label: "Hotspot" },
  hardware: { icon: Microchip, color: "text-stone-300", bg: "bg-stone-800/40", border: "border-stone-700/50", label: "Hardware" },
  module: { icon: Layers, color: "text-stone-400", bg: "bg-stone-800/40", border: "border-stone-700/50", label: "Module" }
};

export function AegisNode({ data, selected }: { data: AegisNodeData; selected: boolean }) {
  const config = TYPE_CONFIG[data.type] || TYPE_CONFIG.module;
  const Icon = config.icon;
  const intensity = data.intensity ?? 0;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ y: -1, transition: { duration: 0.3 } }}
      className={`relative px-5 py-4 min-w-[240px] transition-all duration-500 bg-stone-900/60 backdrop-blur-xl border border-stone-800/40 ${
        selected 
          ? "border-stone-600 shadow-[0_0_30px_rgba(0,0,0,0.4)] z-10" 
          : data.isBlastRadius
          ? `border-stone-700 bg-stone-800/20`
          : "shadow-2xl"
      }`}
    >
      {/* Visual Anchor Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${selected ? "bg-stone-500" : "bg-transparent"} transition-all duration-500`} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className={`h-3 w-3 ${config.color} opacity-60`} />
          <span className="text-[9px] font-semibold tracking-[0.2em] text-stone-500 uppercase">
            {config.label}
          </span>
        </div>
        {data.metadata.centrality !== undefined && data.metadata.centrality > 0.1 && (
          <div className="h-1.5 w-1.5 rounded-full bg-stone-600" title="Core Module" />
        )}
      </div>

      <div>
        <div className={`text-sm font-medium tracking-tight ${selected ? "text-stone-100" : "text-stone-300"}`}>
          {data.label}
        </div>
        <div className="mt-4 flex items-baseline gap-4">
          <div className="text-[10px] font-mono text-stone-600 tracking-wider">
            {data.metadata.lines.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-stone-700">
            {data.metadata.language.toUpperCase()}
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="!bg-stone-800 !border-none !w-full !h-[1px] !top-0 !rounded-none opacity-20" />
      <Handle type="source" position={Position.Bottom} className="!bg-stone-800 !border-none !w-full !h-[1px] !bottom-0 !rounded-none opacity-20" />
    </motion.div>
  );
}
