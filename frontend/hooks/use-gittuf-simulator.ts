import { useState, useCallback, useMemo, useEffect } from "react"
import type { SimulatorResponse, ApprovalRequirement, EligibleSigner, CustomConfig, CustomPerson, CustomRole } from "@/lib/simulator-types"
import fixtureAllowed from "@/fixtures/fixture-allowed.json"
import fixtureBlocked from "@/fixtures/fixture-blocked.json"

const DEFAULT_CONFIG: CustomConfig = {
  people: [
    {
      id: "alice",
      display_name: "Alice Johnson",
      keyid: "ssh-rsa-abc123",
      key_type: "ssh",
      has_signed: false,
    },
    {
      id: "bob",
      display_name: "Bob Smith",
      keyid: "gpg-def456",
      key_type: "gpg",
      has_signed: false,
    },
    {
      id: "charlie",
      display_name: "Charlie Brown",
      keyid: "sigstore-ghi789",
      key_type: "sigstore",
      has_signed: false,
    },
  ],
  roles: [
    {
      id: "maintainer",
      display_name: "Maintainer",
      threshold: 2,
      file_globs: ["src/**", "docs/**"],
      assigned_people: ["alice", "bob", "charlie"],
    },
    {
      id: "reviewer",
      display_name: "Reviewer",
      threshold: 1,
      file_globs: ["tests/**"],
      assigned_people: ["alice", "bob"],
    },
  ],
}

export function useGittufSimulator() {
  // Core UI State
  const [darkMode, setDarkMode] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const [showSimulator, setShowSimulator] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Simulator State
  const [currentFixture, setCurrentFixture] = useState<"blocked" | "allowed" | "custom">("blocked")
  const [whatIfMode, setWhatIfMode] = useState(false)
  const [simulatedSigners, setSimulatedSigners] = useState<Set<string>>(new Set())

  // UI Layout State
  const [expandedGraph, setExpandedGraph] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  // Custom Config State
  const [showCustomConfig, setShowCustomConfig] = useState(false)
  const [customConfig, setCustomConfig] = useState<CustomConfig>(DEFAULT_CONFIG)

  // Form States
  const [newPersonForm, setNewPersonForm] = useState({
    id: "",
    display_name: "",
    keyid: "",
    key_type: "ssh" as const,
    has_signed: false,
  })

  const [newRoleForm, setNewRoleForm] = useState({
    id: "",
    display_name: "",
    threshold: 1,
    file_globs: ["src/**"],
    assigned_people: [] as string[],
  })

  const [editingPerson, setEditingPerson] = useState<CustomPerson | null>(null)
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null)

  // Generate custom fixture from config
  const customFixture = useMemo((): SimulatorResponse => {
    const approval_requirements: ApprovalRequirement[] = customConfig.roles.map((role) => {
      const eligible_signers: EligibleSigner[] = role.assigned_people
        .map((personId) => {
          const person = customConfig.people.find((p) => p.id === personId)
          return person
            ? {
                id: person.id,
                display_name: person.display_name,
                keyid: person.keyid,
                key_type: person.key_type,
              }
            : null
        })
        .filter(Boolean) as EligibleSigner[]

      const satisfiers = eligible_signers
        .filter((signer) => {
          const person = customConfig.people.find((p) => p.id === signer.id)
          return person?.has_signed
        })
        .map((signer) => ({
          who: signer.id,
          keyid: signer.keyid,
          signature_valid: true,
          signature_time: new Date().toISOString(),
          signature_verification_reason: `Valid ${signer.key_type.toUpperCase()} signature`,
        }))

      return {
        role: role.id,
        role_metadata_version: 1,
        threshold: role.threshold,
        file_globs: role.file_globs,
        eligible_signers,
        satisfied: satisfiers.length,
        satisfiers,
      }
    })

    const allRequirementsMet = approval_requirements.every((req) => req.satisfied >= req.threshold)

    const visualization_hint = {
      nodes: [
        ...customConfig.roles.map((role) => ({
          id: role.id,
          type: "role" as const,
          label: `${role.display_name} (${
            approval_requirements.find((req) => req.role === role.id)?.satisfied || 0
          }/${role.threshold})`,
          meta: {
            satisfied: (approval_requirements.find((req) => req.role === role.id)?.satisfied || 0) >= role.threshold,
            threshold: role.threshold,
            current: approval_requirements.find((req) => req.role === role.id)?.satisfied || 0,
          },
        })),
        ...customConfig.people.map((person) => ({
          id: person.id,
          type: "person" as const,
          label: person.display_name,
          meta: {
            signed: person.has_signed,
            keyType: person.key_type,
          },
        })),
      ],
      edges: customConfig.roles.flatMap((role) =>
        role.assigned_people.map((personId) => {
          const person = customConfig.people.find((p) => p.id === personId)
          return {
            from: personId,
            to: role.id,
            label: person?.has_signed ? "Approved" : "Eligible",
            satisfied: person?.has_signed || false,
          }
        }),
      ),
    }

    return {
      result: allRequirementsMet ? "allowed" : "blocked",
      reasons: allRequirementsMet
        ? ["All approval requirements satisfied"]
        : approval_requirements
            .filter((req) => req.satisfied < req.threshold)
            .map((req) => `Missing ${req.threshold - req.satisfied} ${req.role} approval(s)`),
      approval_requirements,
      signature_verification: approval_requirements.flatMap((req) =>
        req.satisfiers.map((satisfier, index) => ({
          signature_id: `sig-${req.role}-${index + 1}`,
          keyid: satisfier.keyid,
          sig_ok: satisfier.signature_valid,
          verified_at: satisfier.signature_time,
          reason: satisfier.signature_verification_reason,
        })),
      ),
      attestation_matches: [
        {
          attestation_id: "att-custom-001",
          rsl_index: 42,
          maps_to_proposal: true,
          from_revision_ok: true,
          target_tree_hash_match: true,
          signature_valid: true,
        },
      ],
      visualization_hint,
    }
  }, [customConfig])

  // Get current fixture
  const getCurrentFixture = useCallback((): SimulatorResponse => {
    switch (currentFixture) {
      case "allowed":
        return fixtureAllowed as SimulatorResponse
      case "custom":
        return customFixture
      default:
        return fixtureBlocked as SimulatorResponse
    }
  }, [currentFixture, customFixture])

  const fixture = getCurrentFixture()

  // Calculate what-if result
  const displayResult = useMemo((): SimulatorResponse => {
    if (!whatIfMode || simulatedSigners.size === 0) return fixture

    const whatIfResult = JSON.parse(JSON.stringify(fixture)) as SimulatorResponse

    whatIfResult.approval_requirements = whatIfResult.approval_requirements.map((req) => {
      const additionalSatisfiers = req.eligible_signers
        .filter((signer) => simulatedSigners.has(signer.id) && !req.satisfiers.some((s) => s.who === signer.id))
        .map((signer) => ({
          who: signer.id,
          keyid: signer.keyid,
          signature_valid: true,
          signature_time: new Date().toISOString(),
          signature_verification_reason: "Simulated signature",
        }))

      return {
        ...req,
        satisfied: req.satisfied + additionalSatisfiers.length,
        satisfiers: [...req.satisfiers, ...additionalSatisfiers],
      }
    })

    const allRequirementsMet = whatIfResult.approval_requirements.every((req) => req.satisfied >= req.threshold)
    whatIfResult.result = allRequirementsMet ? "allowed" : "blocked"

    if (allRequirementsMet && fixture.result === "blocked") {
      whatIfResult.reasons = ["All approval requirements satisfied (with simulated signatures)"]
    }

    return whatIfResult
  }, [whatIfMode, simulatedSigners, fixture])

  // Event Handlers
  const handleRunSimulation = useCallback(async () => {
    setIsProcessing(true)
    setShowSimulator(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsProcessing(false)
  }, [])

  const handleSimulatedSignerToggle = useCallback((signerId: string, checked: boolean) => {
    setSimulatedSigners((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(signerId)
      } else {
        newSet.delete(signerId)
      }
      return newSet
    })
  }, [])

  const handleExportJson = useCallback(() => {
    const dataStr = JSON.stringify(displayResult, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `gittuf-simulation-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [displayResult])

  const addPerson = useCallback(() => {
    if (!newPersonForm.id || !newPersonForm.display_name) return

    const newPerson = {
      ...newPersonForm,
      keyid: newPersonForm.keyid || `${newPersonForm.key_type}-${Date.now()}`,
    }

    setCustomConfig((prev) => ({
      ...prev,
      people: [...prev.people, newPerson],
    }))

    setNewPersonForm({
      id: "",
      display_name: "",
      keyid: "",
      key_type: "ssh",
      has_signed: false,
    })
  }, [newPersonForm])

  const addRole = useCallback(() => {
    if (!newRoleForm.id || !newRoleForm.display_name) return

    setCustomConfig((prev) => ({
      ...prev,
      roles: [...prev.roles, { ...newRoleForm }],
    }))

    setNewRoleForm({
      id: "",
      display_name: "",
      threshold: 1,
      file_globs: ["src/**"],
      assigned_people: [],
    })
  }, [newRoleForm])

  const deletePerson = useCallback((id: string) => {
    setCustomConfig((prev) => ({
      ...prev,
      people: prev.people.filter((p) => p.id !== id),
      roles: prev.roles.map((role) => ({
        ...role,
        assigned_people: role.assigned_people.filter((pid) => pid !== id),
      })),
    }))
  }, [])

  const deleteRole = useCallback((id: string) => {
    setCustomConfig((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r.id !== id),
    }))
  }, [])

  const updatePerson = useCallback((person: CustomPerson) => {
    setCustomConfig((prev) => ({
      ...prev,
      people: prev.people.map((p) => (p.id === person.id ? person : p)),
    }))
    setEditingPerson(null)
  }, [])

  const updateRole = useCallback((role: CustomRole) => {
    setCustomConfig((prev) => ({
      ...prev,
      roles: prev.roles.map((r) => (r.id === role.id ? role : r)),
    }))
    setEditingRole(null)
  }, [])

  const togglePersonSigned = useCallback((personId: string) => {
    setCustomConfig((prev) => ({
      ...prev,
      people: prev.people.map((p) => (p.id === personId ? { ...p, has_signed: !p.has_signed } : p)),
    }))
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e || !e.key || typeof e.key !== "string") return
      if (e.ctrlKey || e.metaKey) return

      try {
        const key = e.key.toLowerCase()

        switch (key) {
          case "r":
            e.preventDefault()
            handleRunSimulation()
            break
          case "w":
            e.preventDefault()
            setWhatIfMode(!whatIfMode)
            break
          case "s":
            e.preventDefault()
            setShowStory(true)
            break
          case "e":
            e.preventDefault()
            handleExportJson()
            break
          case "f":
            e.preventDefault()
            setExpandedGraph(!expandedGraph)
            break
          case "c":
            e.preventDefault()
            setShowCustomConfig(!showCustomConfig)
            break
        }
      } catch (error) {
        console.warn("Keyboard shortcut error:", error)
      }
    }

    // Only attach listener if no modal is open (simplified check)
    // In a real app we might want more robust context
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleRunSimulation, handleExportJson, whatIfMode, expandedGraph, showCustomConfig, setShowStory, setWhatIfMode, setExpandedGraph, setShowCustomConfig])

  return {
    darkMode, setDarkMode,
    showStory, setShowStory,
    showSimulator, setShowSimulator,
    isProcessing,
    currentFixture, setCurrentFixture,
    whatIfMode, setWhatIfMode,
    simulatedSigners,
    expandedGraph, setExpandedGraph,
    showControls, setShowControls,
    showDetails, setShowDetails,
    showCustomConfig, setShowCustomConfig,
    customConfig,
    newPersonForm, setNewPersonForm,
    newRoleForm, setNewRoleForm,
    editingPerson, setEditingPerson,
    editingRole, setEditingRole,
    fixture,
    displayResult,
    handleRunSimulation,
    handleSimulatedSignerToggle,
    handleExportJson,
    addPerson,
    addRole,
    deletePerson,
    deleteRole,
    updatePerson,
    updateRole,
    togglePersonSigned,
    customFixture // Exporting just in case, though handled internally
  }
}
