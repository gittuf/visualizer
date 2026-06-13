# gittuf Metadata Visualizer (Frontend)

This directory contains the active frontend for the gittuf metadata visualizer,
written in Next.js.

## Features

- **Repository Entry Flow**: Connect a remote repository, point at a local
  repository, or launch the demo workspace from the home screen.
- **Policy Graph Workspace**: Explore one or more draggable policy graphs inside
  the main visualizer canvas, with tabbed canvases along the bottom bar.
- **Graph Source Controls**: Inspect repository, policy ref, policy version,
  metadata source, and active mode from the detail panel.
- **Policy Query Panel**: Query a branch and changed path to see the matched
  rule, required approvals, and authorized users.
- **History Timeline**: Open a history view with sortable commits, a commit
  strip, and graph canvases for browsing policy state across revisions.
- **Comparison Canvas**: Generate side-by-side base and compare graphs with
  added, removed, modified, and unchanged diff highlighting.
- **Metadata and Settings Panels**: Review metadata status and summary views,
  then adjust visible node/detail settings for the workspace.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Tailwind CSS, shadcn UI components, Radix UI
- **Visualization**: ReactFlow, Chart.js & react-chartjs-2, Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript
- **Linting**: ESLint (Next.js Core Web Vitals, TypeScript)
- **Testing**: Typecheck + lint today, broader automated UI tests still to be added

## Getting Started

### Prerequisites

- Node.js ≥18
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repo
git clone https://github.com/gittuf/visualizer.git
cd visualizer/frontend

# Install dependencies
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

### Running Locally

```bash
npm run dev
# or yarn dev / pnpm dev / bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/
│   ├── globals.css                 # Tailwind & global styles
│   ├── layout.tsx                  # Root layout & metadata
│   ├── page.tsx                    # Home route: repository entry + visualizer workspace
├── screens/
│   ├── repository/
│   │   └── repository-selector.tsx # Repository selection screen
│   └── visualizer/
│       ├── visualizer-workspace.tsx
│       ├── policy-graph-canvas.tsx
│       ├── history-canvas.tsx
│       ├── detail-content.tsx
│       └── panel-tabs/             # Detail panel tabs shown inside the workspace
├── components/
│   ├── app/                        # Shared app shell pieces
│   ├── common/                     # Reusable non-route-specific feature components
│   ├── ui/                         # shadcn/Radix-based UI primitives
│   └── visualizer/                 # Shared visualizer controls and primitives
├── hooks/
│   └── visualizer/                 # Visualizer-specific hooks
├── lib/                            # Utilities, constants, demo fixtures, and API helpers
├── archive/                        # Non-runtime historical code only; do not treat this as active architecture
├── public/                         # Static assets served by Next.js
├── assets/                         # Imported image assets used by the UI
├── components.json                 # shadcn config
├── next.config.mjs
├── package.json
└── tsconfig.json
```

## Usage

1. Open the home route and enter a Git repository URL, choose a local
   repository, or launch the demo workspace.
2. Explore the visualizer workspace, including the graph canvas, history strip,
   and detail panel tabs.

## Contributor Notes

- Active runtime code lives in `app/`, `screens/`, `components/`, `hooks/`,
  and `lib/`.
- `archive/` is intentionally kept only for historical reference and is not
  part of the active frontend architecture.
- The current home flow is:
  `app/page.tsx` -> `hooks/use-repository-session.ts` ->
  `screens/repository/repository-selector.tsx` ->
  `screens/visualizer/visualizer-workspace.tsx`
- The visualizer feature is organized by responsibility:
  `use-visualizer-layout.ts`, `use-visualizer-tabs.ts`,
  `use-visualizer-history-compare.ts`, and `use-graph-viewport.ts`
  coordinate the workspace state, while the policy graph renderer is split
  between canvas composition, SVG rendering, and per-lane rendering helpers.
