"use client"

import { AnimatePresence, motion } from "framer-motion"
import { StoryModal } from "@/components/shared/story-modal"
import { StatusCard } from "@/components/shared/status-card"
import { useGittufSimulator } from "@/hooks/use-gittuf-simulator"
import { SimulatorHeader } from "@/components/features/simulator/simulator-header"
import { SimulatorControls } from "@/components/features/simulator/simulator-controls"
import { SimulatorGraph } from "@/components/features/simulator/simulator-graph"
import { SimulatorAnalysis } from "@/components/features/simulator/simulator-analysis"
import { SimulatorGlossary } from "@/components/features/simulator/simulator-glossary"
import { SimulatorConfigModal } from "@/components/features/simulator/simulator-config-modal"

export default function SimulatorPage() {
  const state = useGittufSimulator()
  const {
    darkMode,
    showStory,
    setShowStory,
    showSimulator,
    setShowSimulator,
    displayResult,
    expandedGraph,
    fixture,
  } = state

  return (
    <div
      data-testid="homepage-container"
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Story Modal */}
      <StoryModal
        data-testid="story-modal"
        isOpen={showStory}
        onClose={() => setShowStory(false)}
        fixture={fixture}
        onOpenSimulator={() => {
          setShowStory(false)
          setShowSimulator(true)
        }}
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <SimulatorHeader state={state} />

        {/* Main Simulator UI */}
        <AnimatePresence>
          {showSimulator && (
            <motion.div
              data-testid="simulator-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <StatusCard 
                data-testid="status-card"
                result={displayResult.result} 
                reasons={displayResult.reasons} 
              />

              {/* Main Content Area */}
              <div className={`grid gap-6 ${expandedGraph ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-4"}`}>
                <SimulatorControls state={state} data-testid="simulator-controls"/>
                <SimulatorGraph state={state} data-testid="simulator-graph" />
              </div>

              {/* Detailed Results */}
              <SimulatorAnalysis state={state} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Glossary */}
        <SimulatorGlossary data-testid="simulator-glossary" state={state} />
      </div>

      {/* Custom Config Dialog */}
      <SimulatorConfigModal state={state} />
    </div>
  )
}