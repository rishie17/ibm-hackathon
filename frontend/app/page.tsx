"use client";

import { motion } from "framer-motion";
import { Compass, GitPullRequestArrow, Map, Search } from "lucide-react";
import { FormEvent, useState } from "react";

import { AnalysisPanel } from "@/components/AnalysisPanel";
import { DependencyGraph } from "@/components/DependencyGraph";
import { MetricCard } from "@/components/MetricCard";
import { analyzeRepository, traceFlow } from "@/lib/api";
import type { AnalysisResponse, TraceResponse } from "@/types/repolens";

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
    <main className="repolens-shell">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-5 py-5 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-teal-200">
              <Compass className="h-4 w-4" />
              RepoLens AI
            </div>
            <h1 className="mt-3 text-4xl font-semibold text-white lg:text-6xl">Google Maps for codebases.</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
              Repository intelligence for architecture understanding, flow tracing, technical debt visibility,
              and modernization planning.
            </p>
          </div>
          <div className="rounded-lg border border-teal-300/30 bg-teal-300/10 px-4 py-3 text-sm text-teal-100">
            {status}
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <form onSubmit={handleAnalyze} className="rounded-lg border border-slate-700/70 bg-slate-950/50 p-4">
            <label className="text-sm font-medium text-white" htmlFor="repo-path">
              Local repository path
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="repo-path"
                value={repoPath}
                onChange={(event) => setRepoPath(event.target.value)}
                className="min-h-11 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-teal-300"
                placeholder="C:\Users\you\project"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Map className="h-4 w-4" />
                Analyze
              </button>
            </div>
          </form>

          <form onSubmit={handleTrace} className="rounded-lg border border-slate-700/70 bg-slate-950/50 p-4">
            <label className="text-sm font-medium text-white" htmlFor="query">
              Architecture query
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-h-11 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-amber-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Search className="h-4 w-4" />
                Trace
              </button>
            </div>
          </form>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Files analyzed" value={analysis.summary.files_analyzed} detail={languageSummary || "Awaiting repository analysis"} tone="accent" />
          <MetricCard label="Total lines" value={analysis.summary.total_lines} detail="Source footprint across supported languages" />
          <MetricCard label="Debt score" value={analysis.debt.debt_score} detail="Dependency, size, and fragility pressure" tone="warning" />
          <MetricCard label="Modernization ready" value={`${analysis.debt.modernization_readiness}%`} detail="Initial readiness estimate" tone="accent" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex flex-col gap-3 rounded-lg border border-slate-700/70 bg-slate-950/50 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <GitPullRequestArrow className="h-4 w-4 text-teal-300" />
                  Dependency Graph
                </div>
                <p className="mt-1 text-sm text-slate-400">{analysis.summary.root}</p>
              </div>
              <div className="text-sm text-slate-400">
                {analysis.graph.nodes.length} modules - {analysis.graph.edges.length} relationships
              </div>
            </div>
            <DependencyGraph graph={analysis.graph} highlightedFiles={highlightedFiles} />

            {trace && (
              <section className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-4">
                <div className="text-sm font-semibold text-white">Flow Trace</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{trace.summary}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {trace.steps.map((step) => (
                    <div key={step.file} className="rounded-md border border-slate-700/70 bg-slate-950/50 p-3">
                      <div className="truncate text-sm font-medium text-white">{step.file}</div>
                      <div className="mt-2 text-sm leading-5 text-slate-400">{step.reason}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>

          <AnalysisPanel debt={analysis.debt} modernization={analysis.modernization} />
        </section>
      </div>
    </main>
  );
}
