"use client"

import type React from "react"

import Image from "next/image"
import { useMemo, useState } from "react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import clipIcon from "@/assets/clip.png"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { RepositoryInfo } from "@/lib/repository-handler"

interface RepositorySelectorProps {
  onRepositorySelect: (info: RepositoryInfo) => void
  onTryDemo: () => void
  isLoading: boolean
  error: string | null
  currentRepository: RepositoryInfo | null
}

interface ValidationDetails {
  type: "remote" | "local"
  platform?: string
  url?: string
  path?: string
}

const SURFACE_BORDER = "var(--secondary-color)"
const CONTROL_BORDER = "var(--tertiary-color)"
const PARAGRAPH_COLOR = "var(--dark-gray)"
const BUTTON_COLOR = "var(--secondary-color)"

function StepIndicator({ step }: { step: number }) {
  return (
    <div
      className="flex h-11 w-11 items-center justify-center rounded-full text-2xl font-medium text-black"
      style={{ backgroundColor: SURFACE_BORDER }}
    >
      {step}
    </div>
  )
}

export default function RepositorySelector({
  onRepositorySelect,
  onTryDemo,
  isLoading,
  error,
  currentRepository,
}: RepositorySelectorProps) {
  const [remoteUrl, setRemoteUrl] = useState("")
  const [localPath, setLocalPath] = useState("")
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean
    message: string
    details?: ValidationDetails
  } | null>(null)

  const selectedPolicyLabel = useMemo(() => {
    if (!currentRepository) return "Select a repository to load policy commits"
    return currentRepository.type === "remote" ? currentRepository.path : currentRepository.name
  }, [currentRepository])

  const handleRemoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!remoteUrl.trim()) {
      setValidationStatus({
        isValid: false,
        message: "Please enter a repository URL.",
      })
      return
    }

    const normalizedUrl = /^https?:\/\//i.test(remoteUrl.trim()) ? remoteUrl.trim() : `https://${remoteUrl.trim()}`

    try {
      const url = new URL(normalizedUrl)
      if (
        !url.hostname.includes("github.com") &&
        !url.hostname.includes("gitlab.com") &&
        !url.hostname.includes("bitbucket.org")
      ) {
        setValidationStatus({
          isValid: false,
          message: "Please enter a GitHub, GitLab, or Bitbucket repository URL.",
        })
        return
      }
    } catch {
      setValidationStatus({
        isValid: false,
        message: "Please enter a valid URL.",
      })
      return
    }

    const repoInfo: RepositoryInfo = {
      type: "remote",
      path: normalizedUrl,
      name: normalizedUrl.split("/").pop()?.replace(".git", "") || "Unknown Repository",
    }

    setValidationStatus({
      isValid: true,
      message: "Repository URL validated successfully.",
      details: {
        type: "remote",
        platform: normalizedUrl.includes("github.com")
          ? "GitHub"
          : normalizedUrl.includes("gitlab.com")
            ? "GitLab"
            : "Bitbucket",
        url: normalizedUrl,
      },
    })

    onRepositorySelect(repoInfo)
  }

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!localPath.trim()) {
      setValidationStatus({
        isValid: false,
        message: "Please enter a local repository path.",
      })
      return
    }

    const repoInfo: RepositoryInfo = {
      type: "local",
      path: localPath,
      name: localPath.split("/").pop() || "Local Repo",
    }

    setValidationStatus({
      isValid: true,
      message: "Local repository path accepted.",
      details: {
        type: "local",
        path: localPath,
      },
    })

    onRepositorySelect(repoInfo)
  }

  return (
    <section className="px-4 py-6">
      <div className="mx-auto w-full max-w-[980px]">
        <div className="space-y-3">
          <h1 className="text-[36px] font-bold leading-[1.15] text-black">Getting started with gittuf</h1>
          <p className="text-[20px] leading-[1.35]" style={{ color: PARAGRAPH_COLOR }}>
          In order to get started with gittuf visualizer, please select a repository you would like to visualize. The
          following platforms are supported on gittuf: github, gitlab, bitbucket.
          </p>
        </div>

        <div className="mt-5">
          <Button
            type="button"
            onClick={onTryDemo}
            disabled={isLoading}
            className="h-11 rounded-[5px] border px-6 text-[16px] font-normal text-black shadow-none hover:opacity-90 disabled:opacity-100"
            style={{ backgroundColor: BUTTON_COLOR, borderColor: CONTROL_BORDER }}
          >
            Try Demo
          </Button>
        </div>

        <div className="relative mt-14 grid grid-cols-[72px_minmax(0,1fr)] gap-x-6 gap-y-14">
          <div
            className="absolute left-[35px] top-[22px] bottom-[22px] w-[3px]"
            style={{ backgroundColor: SURFACE_BORDER }}
          />

          <div className="relative z-10 flex justify-center">
            <StepIndicator step={1} />
          </div>

          <div className="space-y-5">
            <h2 className="text-[24px] font-normal leading-[1.25] text-black">Connect a repository</h2>
            <div className="space-y-6">
              <form onSubmit={handleRemoteSubmit} className="space-y-2">
                <p className="text-[14px] leading-[1.4]" style={{ color: PARAGRAPH_COLOR }}>
                  Enter the URL of a git repository that contains gittuf security metadata
                </p>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="flex flex-1 items-center gap-4">
                    <span className="shrink-0 text-[16px] font-normal leading-none text-black md:text-[16px]">
                      https://
                    </span>
                    <Input
                      type="text"
                      placeholder="github.com/username/repository"
                      value={remoteUrl}
                      onChange={(e) => setRemoteUrl(e.target.value.replace(/^https?:\/\//i, ""))}
                      disabled={isLoading}
                      className="h-11 rounded-[5px] border px-4 text-[16px] text-black placeholder:text-[var(--dark-gray)] focus-visible:ring-0 focus-visible:ring-offset-0 md:text-[16px]"
                      style={{ borderColor: CONTROL_BORDER }}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !remoteUrl.trim()}
                    className="h-11 min-w-[120px] rounded-[5px] border px-6 text-[16px] font-normal text-black shadow-none hover:opacity-90 disabled:opacity-100"
                    style={{ backgroundColor: BUTTON_COLOR, borderColor: CONTROL_BORDER }}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                  </Button>
                </div>
              </form>

              <div className="text-center text-[20px] leading-none text-black">or</div>

              <form onSubmit={handleLocalSubmit} className="space-y-2">
                <p className="text-[14px] leading-[1.4]" style={{ color: PARAGRAPH_COLOR }}>
                  Select a local Git repository folder from your computer that contains gittuf security metadata
                </p>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <Input
                    type="text"
                    placeholder="/path/to/local/repo"
                    value={localPath}
                    onChange={(e) => setLocalPath(e.target.value)}
                    disabled={isLoading}
                    className="h-11 rounded-[5px] border px-4 text-[16px] text-black placeholder:text-[var(--dark-gray)] focus-visible:ring-0 focus-visible:ring-offset-0 md:text-[16px]"
                    style={{ borderColor: CONTROL_BORDER }}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !localPath.trim()}
                    className="h-11 min-w-[120px] rounded-[5px] border px-6 text-[16px] font-normal text-black shadow-none hover:opacity-90 disabled:opacity-100"
                    style={{ backgroundColor: BUTTON_COLOR, borderColor: CONTROL_BORDER }}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="relative z-10 flex justify-center">
            <StepIndicator step={2} />
          </div>

          <div className="space-y-5 pb-10">
            <h2 className="text-[24px] font-normal leading-[1.25] text-black">Select policy source</h2>
            <div className="space-y-3">
              <label className="block text-[14px] leading-[1.4]" style={{ color: PARAGRAPH_COLOR }}>
                Choose the policy version you want to inspect
              </label>
              <div
                className="flex min-h-11 items-center rounded-[5px] border px-4 text-[16px]"
                style={{ borderColor: CONTROL_BORDER, color: currentRepository ? "black" : PARAGRAPH_COLOR }}
              >
                {selectedPolicyLabel}
              </div>
            </div>

            {currentRepository && (
              <div className="space-y-3">
                <h3 className="text-[20px] font-normal leading-[1.3] text-black">Metadata Found:</h3>
                <div
                  className="inline-flex min-h-11 items-center gap-2 rounded-[5px] border px-3 py-2 text-[14px] text-black"
                  style={{ borderColor: CONTROL_BORDER }}
                >
                  <Image src={clipIcon} alt="" className="h-5 w-5" />
                  <span>Metadata file ready to inspect</span>
                </div>
              </div>
            )}

            {validationStatus && (
              <div
                className="flex items-start gap-3 rounded-[5px] border px-4 py-3 text-[14px]"
                style={{
                  borderColor: validationStatus.isValid ? "var(--approve-color)" : "var(--reject-color)",
                  backgroundColor: validationStatus.isValid
                    ? "var(--approve-color-12)"
                    : "var(--reject-color-12)",
                  color: validationStatus.isValid ? "var(--approve-color)" : "var(--reject-color)",
                }}
              >
                {validationStatus.isValid ? (
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <div className="space-y-1">
                  <p>{validationStatus.message}</p>
                  {validationStatus.details?.url && <p className="break-all">{validationStatus.details.url}</p>}
                  {validationStatus.details?.path && <p className="break-all">{validationStatus.details.path}</p>}
                </div>
              </div>
            )}

            {error && (
              <div
                className="rounded-[5px] border px-4 py-3 text-[14px]"
                style={{
                  borderColor: "var(--reject-color)",
                  backgroundColor: "var(--reject-color-12)",
                  color: "var(--reject-color)",
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
