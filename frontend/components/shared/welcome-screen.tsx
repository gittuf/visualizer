"use client"

import { Github, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WelcomeScreenProps {
  onTryDemo: () => void
}

export default function WelcomeScreen({ onTryDemo }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] bg-white/80 backdrop-blur-sm rounded-lg border border-dashed border-slate-300 shadow-lg">
      <Github className="h-16 w-16 text-slate-300 mb-4" />
      <h3 className="text-xl font-medium text-slate-700 mb-2">Ready to Explore Security Metadata</h3>
      <p className="text-slate-500 text-center max-w-md mb-4">
        Enter a GitHub repository URL above or try our interactive demo to start learning about gittuf security policies
      </p>
      <Button onClick={onTryDemo} className="bg-blue-600 hover:bg-blue-700">
        <Sparkles className="h-4 w-4 mr-2" />
        Try Interactive Demo
      </Button>
    </div>
  )
}
