import { AlertTriangle, GitBranch, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import type { ModernizationResponse, TechnicalDebtResponse } from "@/types/aegis";

type AnalysisPanelProps = {
  debt: TechnicalDebtResponse;
  modernization: ModernizationResponse;
};

export function AnalysisPanel({ debt, modernization }: AnalysisPanelProps) {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="editorial-label opacity-40 border-b border-stone-800/60 pb-2">Structural Logic</div>
        <div className="space-y-6">
          {debt.issues.length > 0 ? (
            debt.issues.slice(0, 3).map((issue) => (
              <div key={issue.id} className="group space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-stone-300 uppercase tracking-widest">{issue.title}</div>
                  <div className="editorial-label text-[8px] opacity-20">{issue.severity}</div>
                </div>
                <div className="text-xs text-stone-500 leading-relaxed font-medium italic group-hover:text-stone-400 transition-colors">
                  "{issue.recommendation}"
                </div>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-stone-600 font-medium italic">Architectural patterns appear stable.</div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="editorial-label opacity-40 border-b border-stone-800/60 pb-2">Evolutionary Path</div>
        <div className="space-y-5">
          {modernization.roadmap.slice(0, 4).map((step, idx) => (
            <div key={step} className="flex gap-4 group">
              <span className="editorial-label text-[9px] text-stone-700">{(idx + 1).toString().padStart(2, '0')}</span>
              <span className="text-[11px] text-stone-500 group-hover:text-stone-300 transition-colors leading-relaxed font-medium tracking-wide uppercase">{step}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
