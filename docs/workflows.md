# Workflows

## Demo Workflow

1. Start the backend API.
2. Start the frontend.
3. Analyze the bundled `examples` folder or a local repository.
4. Show the generated dependency graph.
5. Ask a query such as `Explain authentication flow`.
6. Highlight impacted files and explain how the flow trace was inferred.
7. Open the modernization panel and discuss extraction candidates, cycles, and readiness.

## Developer Workflow

```bash
python -m venv backend/.venv
backend/.venv/Scripts/activate
pip install -r backend/requirements.txt
python -m uvicorn app.main:app --app-dir backend --reload
```

In another terminal:

```bash
npm install --prefix frontend
npm --prefix frontend run dev
```

## Repository Analysis Workflow

1. Traverse files while ignoring build output and dependency folders.
2. Detect language by file extension.
3. Extract imports and function names.
4. Resolve local imports to known modules.
5. Build a directed module dependency graph.
6. Score hotspots and architecture risks.
7. Return graph-ready data to the frontend.

## Modernization Workflow

1. Identify oversized modules and tightly coupled modules.
2. Detect cyclic dependencies.
3. Rank hotspots by size, imports, and graph degree.
4. Suggest boundary extraction or dependency inversion.
5. Produce a migration roadmap.
6. Capture Bob-assisted modernization sessions in `/bob-sessions`.

## Flow Tracing Workflow

The MVP uses lightweight keyword matching across:

- File paths.
- Import names.
- Function names.
- Neighboring dependency graph nodes.

Future versions should combine this with Tree-sitter symbol references, test execution paths, runtime traces, and IBM Bob reasoning.

