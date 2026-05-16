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
    <main className="aegis-shell min-h-screen">
      <div className="flex flex-col h-screen max-h-screen overflow-hidden">
        {/* Compact Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded bg-teal-500 flex items-center justify-center">
                <Compass className="h-4 w-4 text-slate-950" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase">
                Aegis <span className="text-white/20 font-light">//</span> Mission Control
              </h1>
            </div>
            
            <form onSubmit={handleAnalyze} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-sm px-3 py-1.5 focus-within:border-teal-500/50 transition-all">
              <Map className="h-3 w-3 text-slate-500" />
              <input
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                className="bg-transparent text-xs text-white outline-none w-64"
                placeholder="Target repository path..."
              />
              <button type="submit" disabled={isLoading} className="text-[10px] font-bold uppercase tracking-widest text-teal-400 hover:text-teal-300 disabled:opacity-50">
                Scan
              </button>
            </form>

            <form onSubmit={handleTrace} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-sm px-3 py-1.5 focus-within:border-amber-500/50 transition-all">
              <Search className="h-3 w-3 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent text-xs text-white outline-none w-64"
                placeholder="Trace operational flow..."
              />
              <button type="submit" disabled={isLoading} className="text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 disabled:opacity-50">
                Trace
              </button>
            </form>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase border-r border-white/10 pr-4">
              STATUS: <span className="text-teal-400">{status}</span>
            </div>
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <div className="h-2 w-2 rounded-full bg-slate-800" />
              <div className="h-2 w-2 rounded-full bg-slate-800" />
            </div>
          </div>
        </header>

        {/* Main Operational Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Central Topology View */}
          <div className="flex-1 relative bg-[#0f1115]">
            <div className="absolute top-4 left-6 z-10">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Topology Workspace</div>
              <div className="text-xs font-mono text-slate-400">{analysis.summary.root}</div>
            </div>

            <div className="absolute top-4 right-6 z-10 flex gap-4">
               <div className="glass-panel px-3 py-1.5 flex flex-col items-center min-w-[80px]">
                 <span className="text-[8px] font-bold text-slate-500 uppercase">Nodes</span>
                 <span className="text-sm font-mono text-slate-200">{analysis.graph.nodes.length}</span>
               </div>
               <div className="glass-panel px-3 py-1.5 flex flex-col items-center min-w-[80px]">
                 <span className="text-[8px] font-bold text-slate-500 uppercase">Edges</span>
                 <span className="text-sm font-mono text-slate-200">{analysis.graph.edges.length}</span>
               </div>
            </div>

            <div className="h-full w-full">
              <DependencyGraph graph={analysis.graph} highlightedFiles={highlightedFiles} />
            </div>

            {trace && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 left-6 right-6 max-h-48 glass-panel border-amber-500/30 p-4 overflow-y-auto z-10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Dependency Flow Path</div>
                  <button onClick={() => setTrace(null)} className="text-[10px] text-slate-500 hover:text-white uppercase">Close</button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {trace.steps.map((step, idx) => (
                    <div key={step.file} className="min-w-[200px] glass-panel p-3 border-white/5 bg-white/[0.02]">
                       <div className="flex items-center gap-2 mb-2">
                         <span className="text-[9px] font-mono text-slate-600">0{idx + 1}</span>
                         <div className="truncate text-[10px] font-bold text-white uppercase">{step.file.split('/').pop()}</div>
                       </div>
                       <div className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{step.reason}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Side Intelligence Panel */}
          <aside className="w-[400px] border-l border-white/5 bg-slate-950/40 backdrop-blur-xl overflow-y-auto p-6 space-y-8">
            <section>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6 border-b border-white/5 pb-2">System Metrics</div>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard label="Modules" value={analysis.summary.files_analyzed} detail="Source Files" tone="accent" />
                <MetricCard label="Volume" value={`${(analysis.summary.total_lines / 1000).toFixed(1)}k`} detail="Lines of Code" />
                <MetricCard label="Pressure" value={analysis.debt.debt_score} detail="Graph Fragility" tone="warning" />
                <MetricCard label="Readiness" value={`${analysis.debt.modernization_readiness}%`} detail="Modernization" tone="accent" />
              </div>
            </section>

            <AnalysisPanel debt={analysis.debt} modernization={analysis.modernization} />
          </aside>
        </div>
      </div>
    </main>
  );
}
