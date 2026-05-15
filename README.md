# RepoLens AI

**An intelligence layer for understanding, evolving, and modernizing software systems.**

RepoLens AI is built for the IBM Bob Hackathon as **Google Maps for codebases**: a visual, interactive way to understand repositories, trace feature flows, identify technical debt, and plan modernization work.

![Dashboard screenshot placeholder](docs/assets/dashboard-placeholder.png)
![Dependency graph screenshot placeholder](docs/assets/graph-placeholder.png)

## Why It Exists

Modern software teams inherit large systems where architecture is implicit, dependencies are hard to reason about, and modernization is risky. RepoLens AI turns a repository into a navigable intelligence map:

- See modules and dependencies.
- Trace feature and execution flows.
- Identify risk zones and hotspots.
- Understand technical debt drivers.
- Generate modernization recommendations.
- Accelerate onboarding into unfamiliar codebases.

## MVP Features

- Local repository selection by path.
- Python, JavaScript, and TypeScript source traversal.
- Import extraction and dependency relationship generation.
- NetworkX-backed dependency graph.
- React Flow architecture visualization.
- Natural language flow tracing interface.
- Technical debt scoring for coupling, cycles, and module size.
- Modernization suggestions and migration roadmap.
- AI-readable documentation for rapid iteration.

## Architecture

```text
RepoLens AI
|-- frontend/      Next.js, TypeScript, Tailwind CSS, React Flow, Framer Motion
|-- backend/       FastAPI, Python 3.11+, Pydantic, NetworkX, Tree-sitter-ready parser layer
|-- docs/          Architecture, workflows, modernization, and project context
|-- examples/      Demo repositories and fixtures
`-- bob-sessions/  IBM Bob prompts, outputs, and modernization session notes
```

## Quick Start

### Backend

```bash
python -m venv backend/.venv
backend/.venv/Scripts/activate
pip install -r backend/requirements.txt
python -m uvicorn app.main:app --app-dir backend --reload
```

The API runs on `http://127.0.0.1:8000`.

### Frontend

```bash
npm install --prefix frontend
npm --prefix frontend run dev
```

The app runs on `http://localhost:3000`.

## Demo Flow

1. Start the backend and frontend.
2. Enter `examples` or a local repository path.
3. Click **Analyze** to generate the architecture map.
4. Inspect files, edges, health indicators, debt, and modernization readiness.
5. Ask `Explain authentication flow` or `Find tightly coupled modules`.
6. Watch graph nodes highlight around likely impacted files.
7. Use modernization recommendations to narrate a safe evolution plan.

## API Surface

- `GET /health`
- `POST /api/repositories/analyze`
- `GET /api/graph`
- `POST /api/trace`
- `GET /api/debt`
- `GET /api/modernization`

## IBM Bob Alignment

RepoLens AI complements IBM Bob by giving full-repository reasoning a visual and workflow-driven surface:

- Bob can reason across the repository.
- RepoLens AI turns that reasoning into maps, traces, scores, and modernization plans.
- Bob sessions can be captured in `/bob-sessions` for repeatable SDLC artifacts.
- Modernization recommendations can become phased implementation plans.

TODO(IBM Bob): add a Bob adapter that enriches graph context, trace explanations, and modernization roadmaps with Bob's full-context repository reasoning.

## Roadmap

### Phase 1

- Repository parsing.
- Dependency graph generation.
- FastAPI backend APIs.
- Next.js dashboard shell.
- React Flow visualization.

### Phase 2

- Tree-sitter symbol extraction.
- Function-level call graphs.
- Stronger impact analysis.
- Technical debt trend history in SQLite.
- IBM Bob modernization plan integration.

### Phase 3

- GitHub repository ingestion.
- Runtime trace overlays.
- Pull request impact summaries.
- Team ownership and service boundary maps.
- Enterprise modernization dashboards.

## Project Identity

RepoLens AI is not another chatbot and not another code generator. It is an observability and intelligence layer for software systems.
