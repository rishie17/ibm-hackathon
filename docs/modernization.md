# Modernization Strategy

Aegis treats modernization as an architecture workflow, not a generic code-generation task.

## Signals

The MVP looks for:

- Cyclic dependencies.
- Oversized modules.
- Tightly coupled modules.
- Dense dependency graphs.
- Files with high size and import pressure.

## Scores

- **Debt score** estimates accumulated structural friction.
- **Risk score** estimates fragility when changing the system.
- **Modernization readiness** estimates how prepared the system is for safe migration.

These scores are intentionally explainable. Hackathon demos should show the files and relationships behind the score, not just the number.

## Recommendation Types

- Extract module boundaries.
- Break cyclic dependencies.
- Introduce interfaces or adapters.
- Separate orchestration from domain logic.
- Establish package ownership.
- Sequence migrations around stable boundaries.

## IBM Bob Role

Bob should eventually act as the reasoning partner behind the modernization plan:

- Validate extraction candidates.
- Explain migration risks.
- Generate phased refactor plans.
- Compare legacy and target architecture.
- Produce onboarding notes for each modernization path.

TODO(IBM Bob): connect modernization suggestions to Bob-generated implementation plans and SDLC artifacts.

