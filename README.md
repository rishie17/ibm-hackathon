# Aegis

**Operational intelligence for software modernization.**

Aegis is an architectural observability platform designed to transform complex, undocumented software systems into understandable operational structures. Built for the IBM Bob Hackathon, it provides a "mission control" interface for identifying risk, tracing behavior, and planning the safe evolution of legacy systems.

![Dashboard screenshot placeholder](docs/assets/dashboard-placeholder.png)

## The Core Thesis

Modernization fails primarily because organizations lose visibility into operational behavior. Legacy systems become "black boxes" where architecture is implicit and dependencies are hidden. 

**Aegis restores visibility.** 

It turns repositories into navigable intelligence maps, allowing teams to see the "blast radius" of changes, understand the fragility of their architecture, and modernize with deterministic confidence.

## Key Capabilities

- **Architectural Topology:** Reconstructs system hierarchy using real module resolution (Python & JS/TS) and Dagre-powered layouts.
- **Transitive Blast Radius:** Recursive graph traversal that illuminates the deep "ripple effect" of changes across the system.
- **Deterministic Flow Tracing:** Reconstructs operational pathways based on actual dependency chains (upstream consumers and downstream dependencies).
- **Graph-Derived Intelligence:** Detects structural fragility, God Modules, and cyclic coupling using real NetworkX centrality and density metrics.
- **Modernization Mission Control:** A high-end observability interface where the dependency graph dominates the workflow.
- **Institutional Memory Recovery:** Turns undocumented codebases into observable architectural knowledge with deterministic confidence.

## Visual Philosophy: Mission Control

Aegis is designed with a cinematic, high-end observability aesthetic. The interface feels alive—pulsing with system activity and illuminating architectural density through motion and light.

- **Hierarchical Dependency Graphs:** Interactive, glowing topologies with automated layered layouts.
- **Recursive Blast Radius:** Click any node to witness its operational impact propagate transitively through the entire system.
- **Semantic Node Categorization:** Instant visibility into Service Layers, Infrastructure, and Utilities through visual hierarchy.

## Architecture

```text
Aegis
|-- frontend/      Next.js, TypeScript, React Flow (Customized), Framer Motion, Tailwind CSS
|-- backend/       FastAPI, Python 3.11+, NetworkX (Graph Intelligence), Tree-sitter
|-- docs/          Strategic analysis, architecture, and modernization workflows
|-- examples/      Demo repositories for analysis
`-- bob-sessions/  IBM Bob modernization artifacts and session logs
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

## Demo Narrative

1. **Initialize Scan:** Enter a repository path (e.g., `examples`) and click **Initialize Scan**.
2. **Observe Topology:** Watch the cinematic dependency graph reconstruct the system architecture.
3. **Analyze Pressure:** Check the **Fragility Intelligence** panel for modernization bottlenecks.
4. **Simulate Impact:** Click a critical module to witness the **Blast Radius** propagate outward.
5. **Trace Flow:** Query "How does payment validation work?" to see the operational flow reconstructed.
6. **Plan Evolution:** Use the **Modernization Moves** to narrate a safe, phased migration strategy.

## IBM Bob Integration

Aegis acts as the visual and structural "brain" for IBM Bob's repository reasoning. While Bob provides deep semantic understanding, Aegis provides the topological context and operational visibility required for enterprise-grade modernization decisions.

## Roadmap

- **Phase 1 (Complete):** Architectural observability, dependency graphing, and cinematic UI.
- **Phase 2:** Deep symbol extraction with Tree-sitter, cross-service call tracing, and PR impact summaries.
- **Phase 3:** GitHub integration, runtime observability overlays, and automated migration sidecars.

---

**Aegis: Modernization should not require losing institutional memory.**
