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
        className="glass-panel p-5 border-white/5 rounded-md"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">Fragility Intelligence</div>
        </div>
        
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Score label="DEBT" value={debt.debt_score} tone="neutral" />
          <Score label="RISK" value={debt.risk_score} tone="danger" />
          <Score label="READY" value={debt.modernization_readiness} tone="accent" />
        </div>

        <div className="mt-6 space-y-3">
          <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider border-b border-white/5 pb-2">Primary Structural Issues</div>
          {debt.issues.length > 0 ? (
            debt.issues.slice(0, 4).map((issue) => (
              <div key={issue.id} className="group cursor-default py-1">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-slate-200 group-hover:text-rose-300 transition-colors uppercase tracking-wide">{issue.title}</div>
                  <div className="text-[9px] font-mono text-rose-400/80">{issue.severity.toUpperCase()}</div>
                </div>
                <div className="mt-1.5 text-[11px] leading-relaxed text-slate-500 group-hover:text-slate-400 transition-colors">{issue.recommendation}</div>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-slate-600 italic py-2">No structural issues detected yet.</div>
          )}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-5 border-white/5 rounded-md"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">Modernization Moves</div>
        </div>
        <div className="mt-5 space-y-4">
          {modernization.suggestions.length > 0 ? (
            modernization.suggestions.slice(0, 5).map((suggestion) => (
              <div key={suggestion.id} className="border-l-[1.5px] border-slate-700 pl-3 hover:border-blue-500/50 transition-colors">
                <div className="text-[11px] font-semibold text-slate-200 uppercase tracking-wide">{suggestion.title}</div>
                <div className="mt-1.5 text-[11px] leading-relaxed text-slate-500 italic">"{suggestion.rationale}"</div>
                <div className="mt-2.5 flex gap-4 text-[9px] font-mono font-medium tracking-wider text-slate-600">
                  <span className="text-blue-400/80">IMPACT: {suggestion.impact.toUpperCase()}</span>
                  <span className="text-amber-400/80">EFFORT: {suggestion.effort.toUpperCase()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-slate-600 italic py-2">Awaiting intelligence scan...</div>
          )}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-5 border-white/5 rounded-md"
      >
        <div className="flex items-center gap-2">
          <GitBranch className="h-3.5 w-3.5 text-slate-500" />
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">Execution Roadmap</div>
        </div>
        <div className="mt-5 space-y-3">
          {modernization.roadmap.map((step, idx) => (
            <div key={step} className="flex gap-3 group">
              <span className="text-[9px] font-mono text-slate-600 group-hover:text-blue-400 transition-colors">{(idx + 1).toString().padStart(2, '0')}</span>
              <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed tracking-wide font-medium">{step}</span>
            </div>
          ))}
        </div>
      </motion.section>
    </aside>
  );
}

function Score({ label, value, tone }: { label: string; value: number | string; tone: "neutral" | "accent" | "danger" }) {
  const colors = {
    neutral: "text-slate-200",
    accent: "text-blue-400",
    danger: "text-rose-400"
  };

  return (
    <div className="text-center p-2.5 border border-white/5 bg-slate-900/50 rounded-sm">
      <div className={`text-lg font-semibold font-mono tracking-tight ${colors[tone]}`}>{value}</div>
      <div className="mt-1 text-[9px] font-medium text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  );
}
