export interface SimulatorResponse {
  result: "allowed" | "blocked"
  reasons: string[]
  approval_requirements: ApprovalRequirement[]
  signature_verification: SignatureVerification[]
  attestation_matches: AttestationMatch[]
  visualization_hint: VisualizationHint
}

export interface ApprovalRequirement {
  role: string
  role_metadata_version: number
  threshold: number
  file_globs: string[]
  eligible_signers: EligibleSigner[]
  satisfied: number
  satisfiers: Satisfier[]
}

export interface EligibleSigner {
  id: string
  display_name: string
  keyid: string
  key_type: "ssh" | "gpg" | "sigstore"
}

export interface Satisfier {
  who: string
  keyid: string
  signature_valid: boolean
  signature_time: string
  signature_verification_reason: string
}

export interface SignatureVerification {
  signature_id: string
  keyid: string
  sig_ok: boolean
  verified_at: string
  reason: string
}

export interface AttestationMatch {
  attestation_id: string
  rsl_index: number
  maps_to_proposal: boolean
  from_revision_ok: boolean
  target_tree_hash_match: boolean
  signature_valid: boolean
}

export interface VisualizationHint {
  nodes: VisualizationNode[]
  edges: VisualizationEdge[]
}

export interface VisualizationNode {
  id: string
  type: "role" | "person" | "key"
  label: string
  meta?: Record<string, any>
}

export interface VisualizationEdge {
  from: string
  to: string
  label: string
  satisfied: boolean
}

export interface ProposedChange {
  type: "ref-update" | "commit" | "pr"
  ref?: string
  from?: string
  to?: string
  commit?: string
  pr_json?: string
}
