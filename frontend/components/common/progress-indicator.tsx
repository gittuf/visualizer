"use client"

import { CheckCircle, Circle, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ProgressIndicatorProps {
  currentStep: number
  steps: string[]
  className?: string
}

export default function ProgressIndicator({ currentStep, steps, className = "" }: ProgressIndicatorProps) {
  return (
    <div className={`flex items-center justify-center space-x-2 py-4 ${className}`}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2">
              {index < currentStep ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : index === currentStep ? (
                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
            </div>
            <Badge
              variant="outline"
              className={`mt-1 text-xs ${
                index < currentStep
                  ? "bg-green-50 text-green-700 border-green-200"
                  : index === currentStep
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
              }`}
            >
              {step}
            </Badge>
          </div>
          {index < steps.length - 1 && (
            <ArrowRight className={`h-4 w-4 mx-3 ${index < currentStep ? "text-green-500" : "text-slate-300"}`} />
          )}
        </div>
      ))}
    </div>
  )
}
