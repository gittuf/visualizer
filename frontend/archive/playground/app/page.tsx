"use client"

import { AnimatePresence, motion } from "framer-motion"
import { StoryModal } from "@/components/common/story-modal"
import { StatusCard } from "@/components/common/status-card"
import { useGittufSimulator } from "@/hooks/use-gittuf-simulator"
import { SimulatorHeader } from "@/screens/playground/simulator-header"
import { SimulatorControls } from "@/screens/playground/simulator-controls"
import { SimulatorGraph } from "@/screens/playground/simulator-graph"
import { SimulatorAnalysis } from "@/screens/playground/simulator-analysis"
import { SimulatorGlossary } from "@/screens/playground/simulator-glossary"
import { SimulatorConfigModal } from "@/screens/playground/simulator-config-modal"

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
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Story Modal */}
      <StoryModal
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <StatusCard result={displayResult.result} reasons={displayResult.reasons} />

              {/* Main Content Area */}
              <div className={`grid gap-6 ${expandedGraph ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-4"}`}>
                <SimulatorControls state={state} />
                <SimulatorGraph state={state} />
              </div>

              {/* Detailed Results */}
              <SimulatorAnalysis state={state} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Glossary */}
        <SimulatorGlossary state={state} />
      </div>

      {/* Custom Config Dialog */}
      <SimulatorConfigModal state={state} />
    </div>
  )
}
