# gittuf Metadata Visualizer (Frontend)

This directory contains the frontend for the gittuf metadata visualizer, written
in Next.js.

## Features

- **Commit Visualization**: Browse repository commits and view associated
  security metadata JSON.
- **JSON Tree View**: Interactive tree visualization of JSON structures using
  ReactFlow.
- **JSON Diff Visualization**: Visual diff between two commits’ metadata with
  statistics.
- **JSON Diff Statistics**: Summarize added, removed, changed, and unchanged
  elements.
- **Analysis Dashboard**: Chart the evolution, structure distribution, and
  change frequency across multiple commits.
- **Dynamic File Selection**: Switch between different metadata files (e.g.,
  `root.json`, `targets.json`).

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS, shadcn UI components, Radix UI
- **Visualization**: ReactFlow, Chart.js & react-chartjs-2, Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript
- **Linting**: ESLint (Next.js Core Web Vitals, TypeScript)
- **Testing**: (Add when available)

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
│   └── playground/
│       └── page.tsx                # Interactive visualizer tools route
├── page-views/
│   ├── repository/
│   │   └── repository-selector.tsx # Repository selection screen
│   ├── playground/                 # Route-sized playground sections and trust graph
│   └── visualizer/
│       ├── visualizer-workspace.tsx
│       ├── policy-graph-canvas.tsx
│       ├── workspace-history-canvas.tsx
│       ├── workspace-detail-content.tsx
│       └── panel-tabs/             # Detail panel tabs shown inside the workspace
├── components/
│   ├── app/                        # Shared app shell pieces
│   ├── common/                     # Reusable non-route-specific feature components
│   ├── ui/                         # shadcn/Radix-based UI primitives
│   └── visualizer/                 # Shared visualizer controls and primitives
├── hooks/
│   ├── explorer/                   # Repository explorer hooks
│   └── visualizer/                 # Visualizer-specific hooks
├── lib/                            # Utilities, constants, demo data, and API helpers
├── archive/                         # Older and currently unused page/component implementations from previous version
├── public/                         # Static assets served by Next.js
├── assets/                         # Imported image assets used by the UI
├── fixtures/                       # Simulator fixture data
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
3. Open `/playground` to use the interactive visualizer playground and trust
   graph walkthrough.
