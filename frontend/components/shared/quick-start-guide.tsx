"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Github, Search, Eye, GitCompare, BarChart3, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function QuickStartGuide() {
  const [isOpen, setIsOpen] = useState(false)

  const steps = [
    {
      number: 1,
      title: "Enter Repository URL",
      description: "Paste a GitHub repository URL that contains gittuf metadata",
      icon: <Github className="h-4 w-4" />,
      tip: "Try the demo button if you don't have a gittuf repository handy!",
    },
    {
      number: 2,
      title: "Browse Commits",
      description: "Explore the commit history and select commits to analyze",
      icon: <Search className="h-4 w-4" />,
      tip: "Use the different selection modes: single commit, compare two commits, or analyze multiple commits",
    },
    {
      number: 3,
      title: "Choose View Mode",
      description: "Switch between Normal (beginner-friendly) and Advanced (technical details) modes",
      icon: <Eye className="h-4 w-4" />,
      tip: "Normal mode hides technical details and shows only security-critical information",
    },
    {
      number: 4,
      title: "Visualize & Compare",
      description: "Use different visualization modes to understand the security metadata",
      icon: <GitCompare className="h-4 w-4" />,
      tip: "Tree view is great for beginners, Graph view shows relationships, Compare shows differences",
    },
    {
      number: 5,
      title: "Analyze Trends",
      description: "Select multiple commits to see how security policies evolved over time",
      icon: <BarChart3 className="h-4 w-4" />,
      tip: "Look for patterns in security changes and policy updates",
    },
  ]

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-amber-100/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-lg text-amber-800">Quick Start Guide</CardTitle>
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                  5 steps
                </Badge>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-amber-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-amber-600" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="flex items-start space-x-4 p-3 bg-white rounded-lg border border-amber-200"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-amber-700">{step.number}</span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      {step.icon}
                      <h4 className="font-medium text-slate-800">{step.title}</h4>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{step.description}</p>
                    <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                      💡 <strong>Tip:</strong> {step.tip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
