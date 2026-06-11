---
name: frontend_agent
description: Expert coding agent for the gittuf visualizer frontend
---

# AGENT.md

This file is a frontend-specific guide for AI coding agents and human contributors.
It documents the active architecture in `frontend/` and should be preferred over
historical patterns found under `frontend/archive/`.

## Your role

You are an expert coding agent for this frontend.

- You are fluent in TypeScript, React, Next.js App Router, and Tailwind CSS.
- You read from the active frontend runtime code in `app/`, `screens/`,
  `components/`, `hooks/`, and `lib/`.
- You make changes that preserve the current repository selector -> visualizer
  workspace flow unless the task explicitly asks to change product behavior.
- You prefer extending established frontend patterns over inventing parallel
  abstractions.
- You treat `archive/` and `.next/` as non-authoritative for active architecture.

## Project Overview

- This frontend is a Next.js app for the gittuf visualizer.
- It lets users:
  - connect a repository or launch demo data
  - open a policy-graph workspace
  - inspect graph source, policy query, history, compare, metadata, and settings
  - generate additional canvases and compare policy revisions visually
- Main technologies:
  - Next.js 16 App Router
  - React 19 + TypeScript
  - Tailwind CSS
  - shadcn/Radix UI primitives
  - Framer Motion
  - React Resizable Panels
- High-level architecture:
  - `app/page.tsx` is the route shell
  - `hooks/use-repository-session.ts` owns repository/demo session state
  - `screens/repository/` owns the entry screen
  - `screens/visualizer/` owns the main workspace feature
- Primary user workflow:
  1. Open `/`
  2. Choose demo, remote repo, or local repo
  3. Enter the visualizer workspace
  4. Use the side menu and bottom tabs to inspect graph/history/compare views

## Local Workflow

- Preferred package manager: `npm`
- Install dependencies with:
  - `npm install`
- Run the dev server with:
  - `npm run dev`
- Build for production with:
  - `npm run build`
- Global app styles live in:
  - `app/globals.css`
- Do not add new global styles to `styles/`; that path is not part of the active app flow.

## Repository Structure

Active runtime code:

- `app/`
  - Next.js routes and app-level styling
  - `app/page.tsx` is the current home flow
- `screens/`
  - Feature-level route surfaces
  - `screens/repository/` contains the repository selector screen
  - `screens/visualizer/` contains the policy-graph workspace
- `components/`
  - Shared UI outside route ownership
  - `components/app/` app shell pieces
  - `components/ui/` shadcn/Radix-based primitives
  - `components/visualizer/` reusable visualizer UI
- `hooks/`
  - Shared custom hooks used by active runtime code
  - `hooks/visualizer/` contains visualizer-specific shared hooks
- `lib/`
  - flat shared support code for the active app
  - currently includes:
    - constants
    - repository/mock API helpers
    - JSON helpers
    - demo fixture data
    - shared/shared-feature types
- `assets/`
  - imported image assets used by the UI
- `public/`
  - standard Next.js static assets

Non-runtime or generated code:

- `.next/`
  - generated Next.js output; do not edit
- `node_modules/`
  - installed dependencies; do not edit
- `archive/`
  - historical code only; do not treat this as the active architecture
- `styles/`
  - currently not part of the active frontend flow; check before adding new globals there

Important note:

- Top-level `frontend/pages/` must not be introduced.
  This app uses the App Router, and a top-level `pages` directory can create a
  routing/bundling conflict in Next.js.

## Architecture

### Feature boundaries

- `screens/repository/`
  - repository entry UX only
  - should not own visualizer workspace state
- `screens/visualizer/`
  - owns the policy-graph workspace feature
  - owns visualizer-specific state composition
  - owns policy graph rendering, history/compare state, and panel-tab behavior
- `components/visualizer/`
  - reusable visualizer UI pieces
  - should not become a second state-management layer

### Component hierarchy

- `app/page.tsx`
  - renders `Header`
  - renders either:
    - `screens/repository/repository-selector.tsx`
    - or `screens/visualizer/visualizer-workspace.tsx`
- `screens/visualizer/visualizer-workspace.tsx`
  - composes resizable panels, graph viewport, bottom bar, and detail content
- `screens/visualizer/detail-content.tsx`
  - routes active detail-panel state to the correct panel tab component
- `screens/visualizer/policy-graph-canvas.tsx`
  - composes graph layout, SVG shell, drag behavior, and lane rendering

### State management approach

- State is local React state plus focused custom hooks.
- There is no global app store.
- This is intentional: the current app is feature-centric and the workspace state
  is easier to evolve by composing focused hooks than by maintaining a global store.
- Current major state owners:
  - `use-repository-session.ts`
    - repository/demo session state
  - `use-visualizer-workspace.ts`
    - top-level visualizer state composition
  - `use-visualizer-layout.ts`
    - panel layout persistence and responsive collapse behavior
  - `use-visualizer-tabs.ts`
    - bottom-tab and graph-instance state
  - `use-visualizer-history-compare.ts`
    - history sorting/selection and compare version state
  - `use-graph-viewport.ts`
    - graph viewport sizing and centering

### Data flow

- Repository selection flows:
  - `RepositorySelector` -> `useRepositorySession`
  - `useRepositorySession` -> `RepositoryHandler`
  - active repository/demo payload -> `VisualizerWorkspace`
- Visualizer flows:
  - `VisualizerWorkspace` -> `DetailContent`, graph canvases, bottom bar
  - detail-panel actions update visualizer hooks
  - visualizer hooks feed graph/history/compare renderers

### API interaction patterns

- Repository interaction is abstracted behind `lib/repository-handler.ts`.
- Demo/mock behavior is provided through:
  - `lib/mock-api.ts`
  - `lib/demo-visualizer-fixture.ts`
- Repository connection loading/error handling is currently local-state driven:
  - async handlers set inline `isLoading` / `error` state in `use-repository-session.ts`
  - the repository selector renders that state directly rather than using a global error layer
- Avoid calling mock/demo helpers directly from unrelated UI components if a
  higher-level repository/session abstraction already exists.

### Environment and config

- Runtime/frontend config is currently code-driven rather than env-driven.
- Start by checking:
  - `next.config.mjs`
  - `app/`
  - `lib/repository-handler.ts`
- Do not assume there is an existing `.env` contract unless you confirm it first.

### Type organization

- Shared JSON/domain types:
  - `lib/types.ts`
- Demo visualizer feature types:
  - `lib/demo-visualizer.types.ts`
- Visualizer feature-specific UI/state types:
  - `screens/visualizer/*.types.ts`
- Keep types close to the feature that owns them unless they are clearly shared.

## Development Conventions

### Naming conventions

- Components: PascalCase exports
- Files: kebab-case is the current active convention for feature files and hooks
- Hooks: `use-*.ts` or `use-*.tsx`
- Visualizer files currently use descriptive kebab-case names, e.g.
  - `use-visualizer-layout.ts`
  - `policy-graph-canvas.tsx`
- Types files use `*.types.ts`
- Constants files use `*.constants.ts`
- Utilities files use `*.utils.ts`

### File placement rules

- New route/feature surface:
  - put it in `screens/<feature>/`
- New reusable app-wide or feature-shared component:
  - put it in `components/`
- New visualizer-only reusable component:
  - prefer `components/visualizer/`
- New screen-local component:
  - keep it under the feature folder in `screens/visualizer/` if it is not broadly reusable
- New hook:
  - if it is feature-specific, put it next to that feature or in `hooks/visualizer/`
  - if it is app/shared, put it in `hooks/`
- New type:
  - feature-specific: nearest `*.types.ts`
  - broadly shared: `lib/types.ts` or a focused shared types file in `lib/`
- New utility:
  - feature-specific: nearest `*.utils.ts`
  - broadly shared: `lib/`
- New fixture/demo data:
  - active demo/runtime fixture data goes in `lib/demo-visualizer-fixture.ts`
  - archived/historical examples stay in `archive/`

## Code Style Guidelines

- Use TypeScript strictly; avoid `any`.
- Prefer explicit interfaces/types when state or props are non-trivial.
- Keep React components focused on rendering/composition.
- Extract a hook when a component starts owning:
  - multiple related effects
  - derived state plus event handlers
  - synchronization between multiple panels/tabs/views
- Extract a reusable component when UI is repeated or when a file becomes hard to scan.
- Prefer extending current visualizer patterns instead of introducing a new state model.
- Add comments only for:
  - architectural decisions
  - non-obvious state synchronization
  - graph/layout math
  - diff-color logic
  - persistence/auto-collapse behavior
  - temporary workarounds
- Avoid comments that merely restate the code.
- Before considering a coding task done, always run:
  - `npm run lint`
  - `npx tsc --noEmit`

## Important Architectural Decisions

- Reserved history/compare tabs:
  - `history` and `compare` are stable workspace concepts, not disposable one-off tabs
  - see `screens/visualizer/use-visualizer-tabs.ts`
- Layout persistence:
  - panel sizing is managed through `react-resizable-panels`
  - responsive auto-collapse exists, but manual collapse/expand is still respected
  - see `screens/visualizer/use-visualizer-layout.ts`
- State synchronization:
  - history sort/selection drives the detail panel, timeline strip, and history canvases together
  - compare version state drives the compare tab label and compare canvas payload
- Graph/layout algorithms:
  - lane centering and principal spread are computed in `screens/visualizer/policy-graph.utils.ts`
  - keep principals inside the dotted boundary while preserving readable spacing
- Diff/comparison logic:
  - graph colors are derived from explicit change-type semantics
  - do not color whole subtrees when only leaf values changed
- Persistence/UX tradeoff:
  - the current workspace prefers local hook composition over a centralized global store
  - this keeps the feature easier to refactor but means state ownership must stay disciplined

## Testing Expectations

- Current validation commands:
  - `npm run lint`
  - `npx tsc --noEmit`
- There is no broad automated UI test suite yet.
- When making changes, manually verify:
  - repository selector -> workspace transition
  - demo launch and disconnect/reconnect flow
  - history tab creation and commit strip sync
  - compare tab generation and diff highlighting
  - graph dragging/zooming/overlap behavior
  - responsive panel collapse behavior

## Contributor Guidance

Before making changes:

1. Understand the feature boundary first.
2. Reuse existing abstractions before creating new ones.
3. Preserve existing user workflows.
4. Avoid introducing duplicate utilities, hooks, or types.
5. Prefer extending existing patterns over inventing new ones.

When preparing commits:

- Use the existing branch unless the task explicitly asks for a new one.
- Prefer small, focused commits.
- If DCO is required for the branch/PR, use signed commits/messages such as:
  - `git commit -s -m "your message"`
- If you rewrite commit history, manually verify the visualizer flow again before pushing.

## Common Pitfalls

- Do not treat `archive/` as active architecture.
- Do not add a top-level `pages/` directory in `frontend/`.
- Be careful with `.next/` errors after route/file moves; stale generated types can mislead you.
- Common merge-conflict hotspots:
  - `screens/visualizer/visualizer-workspace.tsx`
  - `screens/visualizer/use-visualizer-workspace.ts`
  - `screens/visualizer/use-visualizer-tabs.ts`
  - `lib/demo-visualizer-fixture.ts`
- Why these are hotspots:
  - workspace composition and tab state are touched by most visualizer features
  - demo fixture data is shared across multiple panels/canvases and often changes with UI updates
- Easy-to-misuse areas:
  - history/compare tab synchronization
  - drag/viewport math in policy graph canvases
  - demo data vs shared type ownership

## Safe Refactoring Guidelines

Usually safe:

- splitting large render components into smaller presentational pieces
- extracting feature-local hooks from a large feature hook
- moving feature-local types into `*.types.ts`
- moving repeated visualizer UI into `components/visualizer/`

Requires extra caution:

- changing repository entry flow in `app/page.tsx` and `use-repository-session.ts`
- changing history/compare reserved-tab behavior
- changing graph drag boundaries or lane/principal spacing
- changing diff-color semantics
- changing panel persistence or collapse behavior

After refactoring, manually verify:

- home -> repo/demo -> workspace flow
- history tab behavior
- compare tab behavior
- policy graph rendering and drag behavior
- responsive workspace layout
