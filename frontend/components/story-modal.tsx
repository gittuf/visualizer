"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Crown,
  Key,
  FileText,
} from "lucide-react"
import { TrustGraph } from "./trust-graph"
import type { SimulatorResponse } from "@/lib/simulator-types"

interface StoryModalProps {
  isOpen: boolean
  onClose: () => void
  fixture: SimulatorResponse
  onOpenSimulator: () => void
}

const storySteps = [
  {
    id: "root",
    title: "Root of Trust",
    icon: Crown,
    description:
      "Every repository starts with a root role that holds the ultimate authority. Think of it as the master key that can delegate permissions to others.",
    focusNodes: ["root"],
    explanation: "The root role is like the owner of a house who can give keys to trusted people.",
  },
  {
    id: "delegation",
    title: "Delegations",
    icon: Key,
    description:
      "The root delegates specific permissions to roles. Each role protects certain files and requires a minimum number of approvals (threshold).",
    focusNodes: ["root", "protect-main"],
    explanation: "Roles are like security guards assigned to protect specific areas of your code.",
  },
  {
    id: "approvals",
    title: "Approvals & Signatures",
    icon: Users,
    description:
      "People with the right permissions can approve changes by signing them. Each signature is verified to ensure it's authentic.",
    focusNodes: ["alice", "bob", "charlie"],
    explanation: "Signatures are like digital stamps of approval from trusted team members.",
  },
  {
    id: "decision",
    title: "Final Decision",
    icon: Shield,
    description:
      "The system checks if enough valid signatures were collected to meet each role's threshold. If yes, the change is allowed!",
    focusNodes: [],
    explanation: "It's like checking if you have enough votes to pass a motion in a meeting.",
  },
]

export function StoryModal({ isOpen, onClose, fixture, onOpenSimulator }: StoryModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [animatePulse, setAnimatePulse] = useState(false)

  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= storySteps.length - 1) {
          setAutoPlay(false)
          return prev
        }
        return prev + 1
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [autoPlay])

  useEffect(() => {
    if (isOpen) {
      setAnimatePulse(true)
      const timer = setTimeout(() => setAnimatePulse(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, isOpen])

  const currentStepData = storySteps[currentStep]
  const StepIcon = currentStepData.icon

  const handleNext = () => {
    if (currentStep < storySteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault()
        handleNext()
        break
      case "ArrowLeft":
        e.preventDefault()
        handlePrev()
        break
      case "Escape":
        e.preventDefault()
        onClose()
        break
      case " ":
        e.preventDefault()
        setAutoPlay(!autoPlay)
        break
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentStep, autoPlay])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <StepIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{currentStepData.title}</h2>
                  <p className="text-sm text-gray-600">
                    Step {currentStep + 1} of {storySteps.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setAutoPlay(!autoPlay)} className="text-gray-600">
                  {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {autoPlay ? "Pause" : "Auto-play"}
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / storySteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
              {/* Left: Explanation */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">What's happening here?</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">{currentStepData.description}</p>
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-400">
                      <p className="text-sm text-blue-800 font-medium">💡 {currentStepData.explanation}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Status */}
                {currentStep === storySteps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card
                      className={`border-2 ${fixture.result === "allowed" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          {fixture.result === "allowed" ? (
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          ) : (
                            <XCircle className="w-8 h-8 text-red-600" />
                          )}
                          <div>
                            <h4 className="font-bold text-lg capitalize">{fixture.result}</h4>
                            <p className="text-sm text-gray-600">
                              {fixture.result === "allowed"
                                ? "This change can proceed safely"
                                : "This change needs more approvals"}
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-1">
                          {fixture.reasons.map((reason, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Try It CTA */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <Button
                    onClick={onOpenSimulator}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    size="lg"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Try the Full Simulator
                  </Button>
                </motion.div>
              </motion.div>

              {/* Right: Interactive Graph */}
              <motion.div
                key={`graph-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Trust Flow Visualization</h3>
                  <Badge variant="outline" className="text-xs">
                    Interactive Graph
                  </Badge>
                </div>

                <div className="h-96 border rounded-lg overflow-hidden">
                  <TrustGraph
                    hint={fixture.visualization_hint}
                    focusedNodes={currentStepData.focusNodes}
                    animatePulse={animatePulse}
                    className="h-full"
                  />
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>Roles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span>People</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-green-500" />
                    <span>Satisfied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-red-500 border-dashed border-t" />
                    <span>Unmet</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {storySteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                disabled={currentStep === storySteps.length - 1}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="px-6 pb-4 text-xs text-gray-500 flex gap-4">
              <span>
                <kbd className="px-1 py-0.5 bg-gray-200 rounded">←→</kbd> Navigate
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-gray-200 rounded">Space</kbd> Auto-play
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-gray-200 rounded">Esc</kbd> Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
