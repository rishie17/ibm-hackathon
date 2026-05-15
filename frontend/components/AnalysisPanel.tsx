import { AlertTriangle, GitBranch, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import type { ModernizationResponse, TechnicalDebtResponse } from "@/types/aegis";

type AnalysisPanelProps = {
  debt: TechnicalDebtResponse;
  modernization: ModernizationResponse;
};

export function AnalysisPanel({ debt, modernization }: AnalysisPanelProps) {
  return (
    <aside className="space-y-6">
      <motion.section 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel p-6 border-danger/20"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-3.5 w-3.5 text-danger" />
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Fragility Intelligence</div>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-4">
          <Score label="DEBT" value={debt.debt_score} tone="neutral" />
          <Score label="RISK" value={debt.risk_score} tone="danger" />
          <Score label="READY" value={debt.modernization_readiness} tone="accent" />
        </div>

        <div className="mt-8 space-y-4">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Primary Structural Issues</div>
          {debt.issues.length > 0 ? (
            debt.issues.slice(0, 4).map((issue) => (
              <div key={issue.id} className="group cursor-default">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white group-hover:text-danger transition-colors uppercase tracking-tight">{issue.title}</div>
                  <div className="text-[9px] font-mono text-danger/60">{issue.severity.toUpperCase()}</div>
                </div>
                <div className="mt-2 text-xs leading-relaxed text-slate-500 group-hover:text-slate-400 transition-colors">{issue.recommendation}</div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-600 italic py-2">No structural issues detected yet.</div>
          )}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-6 border-teal-500/20"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-3.5 w-3.5 text-teal-400" />
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Modernization Moves</div>
        </div>
        <div className="mt-6 space-y-5">
          {modernization.suggestions.length > 0 ? (
            modernization.suggestions.slice(0, 5).map((suggestion) => (
              <div key={suggestion.id} className="border-l-2 border-white/5 pl-4 hover:border-teal-500/30 transition-colors">
                <div className="text-xs font-bold text-white uppercase">{suggestion.title}</div>
                <div className="mt-2 text-xs leading-relaxed text-slate-500 italic">"{suggestion.rationale}"</div>
                <div className="mt-3 flex gap-4 text-[9px] font-mono font-bold tracking-widest text-slate-600">
                  <span className="text-teal-500/60">IMPACT {suggestion.impact}</span>
                  <span className="text-warning/60">EFFORT {suggestion.effort}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-600 italic py-2">Awaiting intelligence scan...</div>
          )}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-6 border-white/5"
      >
        <div className="flex items-center gap-3">
          <GitBranch className="h-3.5 w-3.5 text-slate-500" />
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Execution Roadmap</div>
        </div>
        <div className="mt-6 space-y-4">
          {modernization.roadmap.map((step, idx) => (
            <div key={step} className="flex gap-4 group">
              <span className="text-[9px] font-mono text-slate-700 group-hover:text-teal-500 transition-colors">0{idx + 1}</span>
              <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors leading-relaxed uppercase tracking-tight font-medium">{step}</span>
            </div>
          ))}
        </div>
      </motion.section>
    </aside>
  );
}

function Score({ label, value, tone }: { label: string; value: number | string; tone: "neutral" | "accent" | "danger" }) {
  const colors = {
    neutral: "text-white",
    accent: "text-teal-400",
    danger: "text-danger"
  };

  return (
    <div className="text-center p-3 border border-white/5 bg-white/[0.02] rounded-sm">
      <div className={`text-xl font-bold font-mono tracking-tighter ${colors[tone]}`}>{value}</div>
      <div className="mt-1 text-[9px] font-bold text-slate-600 uppercase tracking-widest">{label}</div>
    </div>
  );
}
