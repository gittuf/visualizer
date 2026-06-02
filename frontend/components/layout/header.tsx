"use client"

import Image from "next/image"
import logo from "@/assets/Logo.png"
import ProgressIndicator from "@/components/shared/progress-indicator"

interface HeaderProps {
  hasCommits: boolean
  currentStep: number
  steps: string[]
}

export default function Header({
  hasCommits,
  currentStep,
  steps,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D9D9D9] bg-white">
      <div className="flex min-h-[52px] w-full items-center justify-between px-5 md:px-6">
        <Image src={logo} alt="gittuf" className="h-auto w-[92px]" priority />
      </div>

      {hasCommits && (
        <div className="mx-auto max-w-7xl px-6 pb-5 md:px-8">
          <ProgressIndicator currentStep={currentStep} steps={steps} />
        </div>
      )}
    </header>
  )
}
