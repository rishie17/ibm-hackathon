"use client";

import { motion } from "framer-motion";
import { Compass, GitPullRequestArrow, Map, Search } from "lucide-react";
import { FormEvent, useState } from "react";

import { AnalysisPanel } from "@/components/AnalysisPanel";
import { DependencyGraph } from "@/components/DependencyGraph";
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
      setStatus("Intelligence map generated");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTrace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus("Tracing dependencies...");
    try {
      const result = await traceFlow(query);
      setTrace(result);
      setStatus("Trace complete");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Trace failed");
    } finally {
      setIsLoading(false);
    }
  }

  const highlightedFiles = trace?.impacted_files ?? [];

  return (
    <main className="aegis-shell min-h-screen bg-[#12100e] text-stone-200 overflow-hidden selection:bg-stone-500/30">
      <div className="flex flex-col h-screen relative">
        
        {/* Cinematic Navigation Overlay */}
        <header className="absolute top-0 left-0 right-0 p-8 flex items-start justify-between pointer-events-none z-50">
          <div className="flex flex-col gap-6 pointer-events-auto">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-stone-100 flex items-center justify-center rounded-sm shadow-2xl">
                <Compass className="h-6 w-6 text-stone-900" />
              </div>
              <div>
                <h1 className="text-xl font-medium tracking-tight text-stone-100">AEGIS</h1>
                <div className="editorial-label -mt-1 opacity-40">System Atlas</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <form onSubmit={handleAnalyze} className="group flex items-center bg-stone-900/60 backdrop-blur-3xl border border-stone-800/40 p-1.5 focus-within:border-stone-700/60 transition-all">
                <input
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  className="bg-transparent text-xs text-stone-300 outline-none w-64 px-3 placeholder:text-stone-700"
                  placeholder="Analyze source..."
                />
                <button type="submit" disabled={isLoading} className="editorial-label px-3 py-1.5 hover:text-stone-100 transition-colors pointer-events-auto">
                  Scan
                </button>
              </form>

              <form onSubmit={handleTrace} className="group flex items-center bg-stone-900/60 backdrop-blur-3xl border border-stone-800/40 p-1.5 focus-within:border-stone-700/60 transition-all">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent text-xs text-stone-300 outline-none w-64 px-3 placeholder:text-stone-700"
                  placeholder="Trace path..."
                />
                <button type="submit" disabled={isLoading} className="editorial-label px-3 py-1.5 hover:text-stone-100 transition-colors pointer-events-auto">
                  Trace
                </button>
              </form>
            </div>
          </div>

          <div className="pointer-events-auto">
            <div className="bg-stone-900/40 backdrop-blur-xl border border-stone-800/40 px-4 py-2 flex items-center gap-4">
              <div className="editorial-label text-[9px] opacity-40">{status}</div>
              <div className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-pulse" />
            </div>
          </div>
        </header>

        {/* Primary Visual Scene */}
        <div className="flex-1 relative bg-[#12100e]">
          <div className="h-full w-full">
            <DependencyGraph graph={analysis.graph} highlightedFiles={highlightedFiles} />
          </div>

          {/* Asymmetrical Floating Intelligence */}
          <aside className="absolute top-32 right-12 bottom-12 w-[380px] pointer-events-none flex flex-col gap-8 z-40">
            <section className="pointer-events-auto floating-artifact p-8 space-y-10 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                <div>
                  <div className="editorial-label opacity-40 mb-4 border-b border-stone-800/60 pb-2">Topology Data</div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <Stat label="Files" value={analysis.summary.files_analyzed} />
                    <Stat label="Volume" value={`${(analysis.summary.total_lines / 1000).toFixed(1)}k`} />
                    <Stat label="Density" value={analysis.debt.debt_score} />
                    <Stat label="Readiness" value={`${analysis.debt.modernization_readiness}%`} />
                  </div>
                </div>

                <AnalysisPanel debt={analysis.debt} modernization={analysis.modernization} />
              </div>
            </section>
            
            <div className="pointer-events-auto bg-stone-900/40 backdrop-blur-xl border border-stone-800/20 p-6">
               <div className="editorial-label opacity-30 mb-2">Root Reference</div>
               <div className="text-[10px] font-mono text-stone-600 truncate">{analysis.summary.root}</div>
            </div>
          </aside>

          {/* Immersive Flow Display */}
          {trace && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-12 left-12 right-[460px] floating-artifact p-8 pointer-events-auto z-40"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="editorial-label text-stone-400">Operational Flow Sequence</div>
                <button onClick={() => setTrace(null)} className="editorial-label opacity-40 hover:opacity-100 transition-opacity">Close</button>
              </div>
              <div className="flex gap-8 overflow-x-auto pb-4 hide-scrollbar">
                {trace.steps.map((step, idx) => (
                  <div key={step.file} className="min-w-[240px] space-y-4 group">
                     <div className="flex items-center gap-3">
                       <span className="editorial-label text-stone-600">0{idx + 1}</span>
                       <div className="truncate text-[11px] font-semibold text-stone-300 uppercase tracking-widest">{step.file.split('/').pop()}</div>
                     </div>
                     <div className="text-xs text-stone-500 leading-relaxed font-medium group-hover:text-stone-400 transition-colors line-clamp-3 italic">"{step.reason}"</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-1">
      <div className="text-[15px] font-medium text-stone-100 font-mono tracking-tighter">{value}</div>
      <div className="editorial-label text-[8px] opacity-30">{label}</div>
    </div>
  );
}
