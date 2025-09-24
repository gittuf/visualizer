# Gittuf Metadata Visualizer (Frontend)

A Next.js application to visualize and analyze gittuf security metadata structures across repository commits.  
Gittuf provides an independent security layer for Git repositories, and this tool helps you explore and compare its metadata over time.

## Features

- **Commit Visualization**: Browse repository commits and view associated security metadata JSON.
- **JSON Tree View**: Interactive tree visualization of JSON structures using ReactFlow.
- **JSON Diff Visualization**: Visual diff between two commits’ metadata with statistics.
- **JSON Diff Statistics**: Summarize added, removed, changed, and unchanged elements.
- **Analysis Dashboard**: Chart the evolution, structure distribution, and change frequency across multiple commits.
- **Dynamic File Selection**: Switch between different metadata files (e.g., `root.json`, `targets.json`).

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
git clone https://github.com/BrawlerXull/Gittuf-Visualizer-Frontend.git
cd Gittuf-Visualizer-Frontend

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
├── app/
│   ├── globals.css      # Tailwind & global styles
│   ├── layout.tsx       # Root layout & metadata
│   └── page.tsx         # Main page with commit form & tabs
├── components/
│   ├── collapsible-card.tsx
│   ├── commit-list.tsx
│   ├── commit-compare.tsx
│   ├── commit-analysis.tsx
│   ├── json-tree-visualization.tsx
│   ├── json-diff-visualization.tsx
│   └── ui/              # Reusable UI primitives (Button, Input, Card, etc.)
├── lib/
│   ├── mock-api.ts      # Mock fetching commits & metadata
│   ├── json-diff.ts     # JSON comparison utilities
│   ├── utils.ts         # Helper functions
│   └── types.ts         # Type definitions
├── public/              # Static assets
├── components.json      # shadcn config
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Usage

1. Enter a GitHub repository URL containing gittuf metadata (e.g., `https://github.com/gittuf/gittuf`).
2. Click **Fetch Repository** to load commits.
3. Select a commit to view its metadata or choose two commits to compare.
4. Switch between **Commits**, **Visualization**, **Compare**, and **Analysis** tabs.
5. Toggle between `root.json` and `targets.json` using the file buttons.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for bug fixes and enhancements.

## License

[MIT](LICENSE)