"use client"

import { motion } from "framer-motion"
import { Shield, Sun, Moon, BookOpen, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SimulatorState } from "@/hooks/use-gittuf-simulator"

interface SimulatorHeaderProps {
  state: SimulatorState
}

export function SimulatorHeader({ state }: SimulatorHeaderProps) {
  const {
    darkMode,
    setDarkMode,
    currentFixture,
    setCurrentFixture,
    setShowStory,
    handleRunSimulation,
    isProcessing,
  } = state

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <div className="text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Policy Verification Simulator
            </h1>
            <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"} mt-1`}>
              Test whether gittuf policy permits your proposed changes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDarkMode(!darkMode)} className="p-2">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Select
            value={currentFixture}
            onValueChange={(v) => setCurrentFixture(v as "blocked" | "allowed" | "custom")}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="allowed">Allowed</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          onClick={() => setShowStory(true)}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Start Story (S)
        </Button>
        <Button
          onClick={handleRunSimulation}
          disabled={isProcessing}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          size="lg"
        >
          {isProcessing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Run Simulation (R)
            </>
          )}
        </Button>
      </div>

      <div className="flex justify-center gap-4 text-sm text-gray-500">
        <span>
          <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700">R</kbd> Run
        </span>
        <span>
          <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700">W</kbd> What-If
        </span>
        <span>
          <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700">S</kbd> Story
        </span>
        <span>
          <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700">C</kbd> Config
        </span>
        <span>
          <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700">F</kbd> Fullscreen
        </span>
      </div>
    </motion.div>
  )
}
