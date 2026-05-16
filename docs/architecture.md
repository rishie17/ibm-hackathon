# Architecture

Aegis is a monorepo with a Next.js frontend and FastAPI backend.

```text
/frontend      Next.js, TypeScript, Tailwind CSS, React Flow, Framer Motion
/backend       FastAPI, Pydantic, NetworkX, Tree-sitter-ready parsing layer
/docs          Architecture, workflows, modernization, and context notes
/examples      Small repositories and fixtures for demos
/bob-sessions  IBM Bob prompts, outputs, and modernization session artifacts
```

## System Flow

1. A user enters a local repository path.
2. The backend traverses supported source files.
3. **Module Resolution Engine:** Parsers resolve absolute and relative imports (Python/JS/TS) to actual repository file paths.
4. **Graph Construction:** NetworkX builds a directed dependency graph.
5. **Graph Intelligence:** Analyzers compute centrality, density, and cycles to detect "God Modules" and structural fragility.
6. **Hierarchical Layout:** The frontend uses Dagre to automatically arrange nodes in a meaningful architectural hierarchy.
7. **Recursive Traversal:** Interactive blast radius analysis computes transitive dependencies on the fly.

## Backend Modules

- `api/`: FastAPI routes including recursive blast radius endpoints.
- `models/`: Pydantic request, response, and domain schemas (aligned with graph semantics).
- `parsers/`: Repository-aware module resolution and import extraction.
- `graph/`: NetworkX dependency graph construction and centrality analysis.
- `analyzers/`: Deterministic technical debt and architecture risk scoring.
- `modernization/`: Graph-driven refactoring and migration recommendations.
- `services/`: Application orchestration and graph traversal logic.

## Frontend Modules

- `app/`: Next.js application shell and dashboard route.
- `components/`: Reusable dashboard, graph, and analysis UI.
- `lib/`: API client and integration utilities.
- `types/`: Shared TypeScript contracts mirroring backend responses.
- `styles/`: Reserved for future design tokens and component primitives.

## Current MVP Intelligence

The first implementation includes:

- **Robust Module Resolution:** Resolves imports to actual file paths, supporting Python packages (`__init__.py`) and JS/TS index files.
- **Hierarchical Layout Engine:** Automatic layered positioning of nodes via Dagre.
- **Transitive Blast Radius:** Multi-level graph traversal to compute system-wide change impact.
- **Semantic Categorization:** Automatic labeling of nodes as Services, Infrastructure, Utilities, or Hotspots based on path patterns and connectivity.
- **Deterministic Trace:** Dependency-chain reconstruction for any module.
- **Graph-Theory Metrics:** Debt and risk scores derived from centrality, density, and cycle counts.

## Future Intelligence Layers

- Tree-sitter language packs for richer symbol extraction.
- Call graph construction and execution-path inference.
- Git history and change frequency overlays.
- Runtime traces from logs, tests, and observability systems.
- IBM Bob full-context reasoning for flow explanations and modernization plans.

TODO(IBM Bob): add an adapter layer that sends repository summaries, graph context, and candidate flow traces to Bob for deeper reasoning.

