"use client";

import { motion } from "framer-motion";
import { Compass, GitPullRequestArrow, Map, Search } from "lucide-react";
import { FormEvent, useState } from "react";

import { AnalysisPanel } from "@/components/AnalysisPanel";
import { DependencyGraph } from "@/components/DependencyGraph";
import { MetricCard } from "@/components/MetricCard";
import { analyzeRepository, traceFlow } from "@/lib/api";
import type { AnalysisResponse, TraceResponse } from "@/types/aegis";

const emptyAnalysis: AnalysisResponse = {
  summary: {
    root: "No repository analyzed yet",
    files_analyzed: 0,
    languages: {},
    total_lines: 0,
    top_hotspots: []
  },
  graph: { nodes: [], edges: [] },
  debt: { debt_score: 0, risk_score: 0, modernization_readiness: 100, issues: [] },
  modernization: {
    suggestions: [],
    roadmap: [
      "Analyze a local repository.",
      "Inspect dependency hotspots.",
      "Trace a feature flow.",
      "Use modernization recommendations to plan the next refactor."
    ]
  }
};

export default function Home() {
  const [repoPath, setRepoPath] = useState("../");
  const [query, setQuery] = useState("Explain authentication flow");
  const [analysis, setAnalysis] = useState<AnalysisResponse>(emptyAnalysis);
  const [trace, setTrace] = useState<TraceResponse | null>(null);
  const [status, setStatus] = useState("Ready");
  const [isLoading, setIsLoading] = useState(false);

  async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus("Analyzing repository...");
    try {
      const result = await analyzeRepository(repoPath);
      setAnalysis(result);
      setTrace(null);
      setStatus("Repository intelligence map generated");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTrace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus("Tracing flow...");
    try {
      const result = await traceFlow(query);
      setTrace(result);
      setStatus("Flow trace complete");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Trace failed");
    } finally {
      setIsLoading(false);
    }
  }

  const highlightedFiles = trace?.impacted_files ?? [];
  const languageSummary = Object.entries(analysis.summary.languages)
    .map(([language, count]) => `${language}: ${count}`)
    .join(" - ");

  return (
    <main className="aegis-shell">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-6 py-8 lg:px-12">
        <header className="flex flex-col gap-6 border-b border-white/5 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-teal-300/80 font-bold">
              <Compass className="h-3.5 w-3.5" />
              Aegis Intelligence
            </div>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-white lg:text-7xl">
              Modernization <span className="text-teal-300/20">/</span> Observability
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
              Transforming complex legacy repositories into understandable operational structures.
              Identify risk, trace behavior, and modernize with confidence.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel px-5 py-3 text-xs font-mono tracking-widest text-teal-300 border-teal-500/20"
          >
            SYSTEM_STATUS: {status.toUpperCase()}
          </motion.div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <form onSubmit={handleAnalyze} className="glass-panel p-6 group">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-teal-400 transition-colors" htmlFor="repo-path">
              Target Repository Path
            </label>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <input
                id="repo-path"
                value={repoPath}
                onChange={(event) => setRepoPath(event.target.value)}
                className="h-12 flex-1 rounded bg-white/5 border border-white/10 px-4 text-sm text-white outline-none transition focus:border-teal-500/50 focus:bg-white/10"
                placeholder="e.g. C:\Users\dev\project"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded bg-teal-500 px-8 text-xs font-bold uppercase tracking-widest text-slate-950 transition hover:bg-teal-400 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Map className="h-4 w-4" />
                Initialize Scan
              </button>
            </div>
          </form>

          <form onSubmit={handleTrace} className="glass-panel p-6 group">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-amber-400 transition-colors" htmlFor="query">
              Operational Flow Query
            </label>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <input
                id="query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 flex-1 rounded bg-white/5 border border-white/10 px-4 text-sm text-white outline-none transition focus:border-amber-500/50 focus:bg-white/10"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded bg-amber-500 px-8 text-xs font-bold uppercase tracking-widest text-slate-950 transition hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Search className="h-4 w-4" />
                Trace Flow
              </button>
            </div>
          </form>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="System Modules" value={analysis.summary.files_analyzed} detail={languageSummary || "Awaiting scan..."} tone="accent" />
          <MetricCard label="Logic Volume" value={analysis.summary.total_lines.toLocaleString()} detail="Total source lines detected" />
          <MetricCard label="Technical Pressure" value={analysis.debt.debt_score} detail="Structural fragility index" tone="warning" />
          <MetricCard label="Modernization Drift" value={`${analysis.debt.modernization_readiness}%`} detail="Readiness for cloud/modular evolution" tone="accent" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex flex-col gap-4 glass-panel p-5 lg:flex-row lg:items-center lg:justify-between border-teal-500/10">
              <div>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400">
                  <GitPullRequestArrow className="h-3 w-3" />
                  System Topology Map
                </div>
                <p className="mt-2 text-sm font-mono text-slate-400">{analysis.summary.root}</p>
              </div>
              <div className="text-[10px] font-mono tracking-widest text-slate-500 bg-white/5 px-3 py-1 rounded">
                {analysis.graph.nodes.length} NODES <span className="text-white/10 mx-1">|</span> {analysis.graph.edges.length} EDGES
              </div>
            </div>
            
            <DependencyGraph graph={analysis.graph} highlightedFiles={highlightedFiles} />

            {trace && (
              <motion.section 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="glass-panel p-6 border-amber-500/30 overflow-hidden"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Operational Flow Reconstruction</div>
                <p className="mt-4 text-base leading-relaxed text-slate-300 italic">"{trace.summary}"</p>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {trace.steps.map((step, idx) => (
                    <div key={step.file} className="glass-panel p-4 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-600 group-hover:text-amber-500/50 transition-colors">0{idx + 1}</span>
                        <div className="truncate text-xs font-bold tracking-wider text-white uppercase">{step.file}</div>
                      </div>
                      <div className="mt-3 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">{step.reason}</div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </motion.div>

          <AnalysisPanel debt={analysis.debt} modernization={analysis.modernization} />
        </section>
      </div>
    </main>
  );
}
