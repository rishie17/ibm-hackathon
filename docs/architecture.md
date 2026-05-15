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
3. Parsers extract imports, functions, file sizes, and language metadata.
4. NetworkX builds a directed dependency graph.
5. Analyzers compute debt, risk, hotspots, cycles, coupling, and modernization readiness.
6. The frontend renders the repository as an interactive architecture map.
7. A natural language query highlights likely files and impact zones.

## Backend Modules

- `api/`: FastAPI routes and HTTP contracts.
- `models/`: Pydantic request, response, and domain schemas.
- `parsers/`: Repository traversal and language import extraction.
- `graph/`: NetworkX dependency graph construction.
- `analyzers/`: Technical debt and architecture risk scoring.
- `modernization/`: Refactoring and migration recommendations.
- `services/`: Application orchestration and future persistence hooks.

## Frontend Modules

- `app/`: Next.js application shell and dashboard route.
- `components/`: Reusable dashboard, graph, and analysis UI.
- `lib/`: API client and integration utilities.
- `types/`: Shared TypeScript contracts mirroring backend responses.
- `styles/`: Reserved for future design tokens and component primitives.

## Current MVP Intelligence

The first implementation includes:

- Python import parsing through `ast`.
- JavaScript and TypeScript import parsing through targeted regular expressions.
- Module dependency graph generation with NetworkX.
- Cycle, coupling, and oversized module detection.
- Keyword-based flow tracing across file paths, imports, and functions.
- Modernization suggestions based on size, coupling, and graph density.

## Future Intelligence Layers

- Tree-sitter language packs for richer symbol extraction.
- Call graph construction and execution-path inference.
- Git history and change frequency overlays.
- Runtime traces from logs, tests, and observability systems.
- IBM Bob full-context reasoning for flow explanations and modernization plans.

TODO(IBM Bob): add an adapter layer that sends repository summaries, graph context, and candidate flow traces to Bob for deeper reasoning.

