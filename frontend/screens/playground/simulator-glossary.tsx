"use client"

import { motion } from "framer-motion"
import { Crown, Shield, FileText, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SimulatorState } from "@/hooks/use-gittuf-simulator"

interface SimulatorGlossaryProps {
  state: SimulatorState
}

export function SimulatorGlossary({ state }: SimulatorGlossaryProps) {
  const { darkMode } = state

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12">
      <Card className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} border-t-4 border-t-blue-500`}>
        <CardHeader>
          <CardTitle className="text-sm">Glossary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Root
              </h4>
              <p className="text-gray-600 text-xs">The ultimate authority that can delegate permissions</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Role
              </h4>
              <p className="text-gray-600 text-xs">A permission set that protects specific files or operations</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Attestation
              </h4>
              <p className="text-gray-600 text-xs">A signed approval tied to a specific change</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Threshold
              </h4>
              <p className="text-gray-600 text-xs">Minimum number of signatures required for approval</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
