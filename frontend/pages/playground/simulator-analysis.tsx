"use client"

import { ChevronUp, ChevronDown, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SimulatorState } from "@/hooks/use-gittuf-simulator"

interface SimulatorAnalysisProps {
  state: SimulatorState
}

export function SimulatorAnalysis({ state }: SimulatorAnalysisProps) {
  const {
    expandedGraph,
    darkMode,
    showDetails,
    setShowDetails,
    displayResult,
    simulatedSigners,
    whatIfMode,
  } = state

  if (expandedGraph) return null

  return (
    <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Detailed Analysis</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)} className="p-1">
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      {showDetails && (
        <CardContent>
          <Tabs defaultValue="approvals" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="signatures">Signatures</TabsTrigger>
              <TabsTrigger value="attestations">Attestations</TabsTrigger>
            </TabsList>

            <TabsContent value="approvals" className="space-y-3 mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                {displayResult.approval_requirements.map((req, index) => (
                  <Card key={index} className={darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50"}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm capitalize">{req.role}</CardTitle>
                        <Badge variant={req.satisfied >= req.threshold ? "default" : "destructive"}>
                          {req.satisfied}/{req.threshold}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-xs text-gray-500">Files: {req.file_globs.join(", ")}</div>
                      <div className="space-y-1">
                        {req.eligible_signers.map((signer) => {
                          const hasSigned = req.satisfiers.some((s) => s.who === signer.id)
                          const isSimulated = simulatedSigners.has(signer.id)

                          return (
                            <div key={signer.id} className="flex items-center gap-2 text-xs">
                              {hasSigned ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : isSimulated && whatIfMode ? (
                                <CheckCircle className="w-3 h-3 text-blue-500" />
                              ) : (
                                <XCircle className="w-3 h-3 text-red-500" />
                              )}
                              <span>{signer.display_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {signer.key_type.toUpperCase()}
                              </Badge>
                              {isSimulated && whatIfMode && (
                                <Badge variant="secondary" className="text-xs">
                                  Simulated
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="signatures" className="space-y-3 mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                {displayResult.signature_verification.map((sig, index) => (
                  <Card key={index} className={darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50"}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{sig.signature_id}</div>
                          <div className="text-xs text-gray-500">Key: {sig.keyid}</div>
                          <div className="text-xs text-gray-500">
                            Verified: {new Date(sig.verified_at).toLocaleString()}
                          </div>
                          {sig.reason && <div className="text-xs text-red-600">{sig.reason}</div>}
                        </div>
                        <Badge variant={sig.sig_ok ? "default" : "destructive"}>
                          {sig.sig_ok ? "Valid" : "Invalid"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="attestations" className="space-y-3 mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                {displayResult.attestation_matches.map((att, index) => (
                  <Card key={index} className={darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50"}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{att.attestation_id}</div>
                          <Badge variant="outline">RSL #{att.rsl_index}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            {att.maps_to_proposal ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                            Maps to proposal
                          </div>
                          <div className="flex items-center gap-1">
                            {att.from_revision_ok ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-red-500" />
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                              </>
                            )}
                            From revision OK
                          </div>
                          <div className="flex items-center gap-1">
                            {att.target_tree_hash_match ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                            Tree hash match
                          </div>
                          <div className="flex items-center gap-1">
                            {att.signature_valid ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                            Signature valid
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  )
}
