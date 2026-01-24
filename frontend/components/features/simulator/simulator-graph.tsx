"use client"

import { motion } from "framer-motion"
import { Sparkles, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrustGraph } from "@/components/features/visualization/trust-graph"
import type { SimulatorState } from "@/hooks/use-gittuf-simulator"

interface SimulatorGraphProps {
  state: SimulatorState
}

export function SimulatorGraph({ state }: SimulatorGraphProps) {
  const {
    expandedGraph,
    setExpandedGraph,
    darkMode,
    displayResult,
    whatIfMode,
    simulatedSigners,
    currentFixture,
    customConfig,
    isProcessing,
    handleSimulatedSignerToggle,
  } = state

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={expandedGraph ? "col-span-1" : "lg:col-span-3"}
    >
      <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Trust Graph Visualization
              {whatIfMode && (
                <Badge variant="secondary" className="text-xs">
                  Interactive Mode
                </Badge>
              )}
              {currentFixture === "custom" && (
                <Badge variant="outline" className="text-xs">
                  Custom Config
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {simulatedSigners.size > 0 && (
                <Badge variant="outline" className="text-xs">
                  {simulatedSigners.size} simulated
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedGraph(!expandedGraph)}
                className="p-2"
              >
                {expandedGraph ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={expandedGraph ? "h-[70vh]" : "h-[60vh]"}>
            <TrustGraph
              hint={displayResult.visualization_hint}
              className="h-full"
              simulatedSigners={simulatedSigners}
              approvalRequirements={displayResult.approval_requirements}
              focusedNodes={[]}
              animatePulse={isProcessing}
              onNodeClick={(nodeId) => {
                const node = displayResult.visualization_hint.nodes.find((n) => n.id === nodeId)
                if (node?.type === "person" && whatIfMode) {
                  handleSimulatedSignerToggle(nodeId, !simulatedSigners.has(nodeId))
                }
              }}
            />
          </div>
          {whatIfMode && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-400">
              <p className="text-sm text-blue-800 font-medium">
                💡 Click on person nodes in the graph to simulate their signatures
              </p>
            </div>
          )}
          {currentFixture === "custom" && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-l-green-400">
              <p className="text-sm text-green-800 font-medium">
                🎯 Using your custom organization configuration with {customConfig.people.length} people and{" "}
                {customConfig.roles.length} roles
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
