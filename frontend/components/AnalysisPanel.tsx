import { AlertTriangle, GitBranch, Sparkles } from "lucide-react";

import type { ModernizationResponse, TechnicalDebtResponse } from "@/types/repolens";

type AnalysisPanelProps = {
  debt: TechnicalDebtResponse;
  modernization: ModernizationResponse;
};

export function AnalysisPanel({ debt, modernization }: AnalysisPanelProps) {
  return (
    <aside className="space-y-4">
      <section className="rounded-lg border border-slate-700/70 bg-slate-950/50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <AlertTriangle className="h-4 w-4 text-amber-300" />
          Technical Debt Radar
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Score label="Debt" value={debt.debt_score} />
          <Score label="Risk" value={debt.risk_score} />
          <Score label="Ready" value={debt.modernization_readiness} />
        </div>
        <div className="mt-4 space-y-3">
          {debt.issues.slice(0, 4).map((issue) => (
            <div key={issue.id} className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
              <div className="text-sm font-medium text-white">{issue.title}</div>
              <div className="mt-1 text-xs uppercase text-slate-500">{issue.severity} - {issue.category}</div>
              <div className="mt-2 text-sm leading-5 text-slate-400">{issue.recommendation}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-700/70 bg-slate-950/50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4 text-teal-300" />
          Modernization Moves
        </div>
        <div className="mt-4 space-y-3">
          {modernization.suggestions.slice(0, 5).map((suggestion) => (
            <div key={suggestion.id} className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
              <div className="text-sm font-medium text-white">{suggestion.title}</div>
              <div className="mt-2 text-sm leading-5 text-slate-400">{suggestion.rationale}</div>
              <div className="mt-3 flex gap-2 text-xs text-slate-300">
                <span className="rounded border border-teal-300/30 px-2 py-1">Impact {suggestion.impact}</span>
                <span className="rounded border border-amber-300/30 px-2 py-1">Effort {suggestion.effort}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-700/70 bg-slate-950/50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <GitBranch className="h-4 w-4 text-teal-300" />
          Migration Roadmap
        </div>
        <ol className="mt-4 space-y-2 text-sm leading-5 text-slate-400">
          {modernization.roadmap.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </aside>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
      <div className="text-xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}
