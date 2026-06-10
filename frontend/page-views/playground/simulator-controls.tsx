"use client"

import { motion } from "framer-motion"
import { Settings, ChevronUp, ChevronDown, Download, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { SimulatorState } from "@/hooks/use-gittuf-simulator"

interface SimulatorControlsProps {
  state: SimulatorState
}

export function SimulatorControls({ state }: SimulatorControlsProps) {
  const {
    expandedGraph,
    showControls,
    setShowControls,
    darkMode,
    whatIfMode,
    setWhatIfMode,
    currentFixture,
    setCurrentFixture,
    displayResult,
    simulatedSigners,
    handleSimulatedSignerToggle,
    handleExportJson,
  } = state

  if (expandedGraph) return null

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-4">
      <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Controls
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowControls(!showControls)} className="p-1">
              {showControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        {showControls && (
          <CardContent className="space-y-4">
            {/* What-If Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">What-If Mode</Label>
              <Switch checked={whatIfMode} onCheckedChange={setWhatIfMode} />
            </div>

            {/* Scenario Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Test Scenario</Label>
              <Select
                value={currentFixture}
                onValueChange={(v) => setCurrentFixture(v as "blocked" | "allowed" | "custom")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blocked">Blocked Scenario</SelectItem>
                  <SelectItem value="allowed">Allowed Scenario</SelectItem>
                  <SelectItem value="custom">Custom Configuration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* What-If Signers */}
            {whatIfMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 border-t pt-3"
              >
                <Label className="text-sm font-medium">Simulate Signatures</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {displayResult.approval_requirements.map((req) =>
                    req.eligible_signers
                      .filter((signer) => !req.satisfiers.some((s) => s.who === signer.id))
                      .map((signer) => (
                        <div key={signer.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sim-${signer.id}`}
                            checked={simulatedSigners.has(signer.id)}
                            onCheckedChange={(checked) =>
                              handleSimulatedSignerToggle(signer.id, checked as boolean)
                            }
                          />
                          <Label htmlFor={`sim-${signer.id}`} className="text-xs flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {signer.display_name}
                          </Label>
                        </div>
                      ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Export Actions */}
            <div className="space-y-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                className="w-full bg-transparent"
              >
                <Download className="w-3 h-3 mr-2" />
                Export JSON
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  )
}
