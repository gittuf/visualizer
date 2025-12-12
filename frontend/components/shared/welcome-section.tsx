"use client"

import { useState } from "react"
import { Shield, GitBranch, FileText, ChevronRight, X, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface WelcomeSectionProps {
  onTryDemo: () => void
  onDismiss: () => void
}

export default function WelcomeSection({ onTryDemo, onDismiss }: WelcomeSectionProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      title: "What is gittuf?",
      description:
        "gittuf is a security layer for Git repositories that provides cryptographic verification and policy enforcement independent of hosting platforms like GitHub.",
      details:
        "It ensures that only authorized users can make changes to your repository by using digital signatures and security policies.",
    },
    {
      icon: <FileText className="h-8 w-8 text-green-500" />,
      title: "Security Metadata",
      description:
        "gittuf stores security policies in JSON files like root.json and targets.json that define who can do what in your repository.",
      details: "These files contain cryptographic keys, access rules, and expiration dates that protect your code.",
    },
    {
      icon: <GitBranch className="h-8 w-8 text-purple-500" />,
      title: "Version History",
      description:
        "This tool helps you visualize how your security policies evolve over time by comparing different commits.",
      details:
        "You can see what changed, when it changed, and understand the security implications of each modification.",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-800">Welcome to gittuf Metadata Visualizer</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Learn about Git repository security through interactive visualization
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onDismiss} className="text-slate-500 hover:text-slate-700">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index <= currentStep ? "bg-blue-500" : "bg-slate-300"
                  }`}
                />
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 transition-colors ${
                      index < currentStep ? "bg-blue-500" : "bg-slate-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Current step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-4"
            >
              <div className="flex justify-center">{steps[currentStep].icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{steps[currentStep].title}</h3>
                <p className="text-slate-600 mb-3">{steps[currentStep].description}</p>
                <p className="text-sm text-slate-500 bg-white/50 p-3 rounded-lg">{steps[currentStep].details}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              Previous
            </Button>

            <div className="flex items-center space-x-3">
              <Button variant="default" onClick={onTryDemo} className="bg-blue-600 hover:bg-blue-700 flex items-center">
                <Play className="h-4 w-4 mr-2" />
                Try Interactive Demo
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  className="flex items-center"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button variant="outline" onClick={onDismiss} className="flex items-center">
                  Get Started
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
