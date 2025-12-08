"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  BookOpen,
  Settings,
  Download,
  Moon,
  Sun,
  Sparkles,
  CheckCircle,
  XCircle,
  Shield,
  Users,
  FileText,
  AlertTriangle,
  Zap,
  Crown,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  Edit,
  Save,
  UserPlus,
  ShieldPlus,
} from "lucide-react"

import { StoryModal } from "@/components/shared/story-modal"
import { StatusCard } from "@/components/shared/status-card"
import { TrustGraph } from "@/components/features/visualization/trust-graph"
import { useGittufSimulator } from "@/hooks/use-gittuf-simulator"

export default function SimulatorPage() {
  const {
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
    togglePersonSigned
  } = useGittufSimulator()


  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Story Modal */}
      <StoryModal
        isOpen={showStory}
        onClose={() => setShowStory(false)}
        fixture={fixture}
        onOpenSimulator={() => {
          setShowStory(false)
          setShowSimulator(true)
        }}
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <div className="text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Policy Verification Simulator
                </h1>
                <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"} mt-1`}>
                  Test whether gittuf policy permits your proposed changes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDarkMode(!darkMode)} className="p-2">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Select
                value={currentFixture}
                onValueChange={(v) => setCurrentFixture(v as "blocked" | "allowed" | "custom")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="allowed">Allowed</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              onClick={() => setShowStory(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Start Story (S)
            </Button>
            <Button
              onClick={handleRunSimulation}
              disabled={isProcessing}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Run Simulation (R)
                </>
              )}
            </Button>
            {/* <Button
              variant="outline"
              size="lg"
              className="shadow-lg bg-transparent"
              onClick={() => setShowCustomConfig(true)}
            >
              <Settings className="w-5 h-5 mr-2" />
              Custom Config (C)
            </Button> */}
          </div>

          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700">R</kbd> Run
            </span>
            <span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700">W</kbd> What-If
            </span>
            <span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700">S</kbd> Story
            </span>
            <span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700">C</kbd> Config
            </span>
            <span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700">F</kbd> Fullscreen
            </span>
          </div>
        </motion.div>

        {/* Main Simulator UI */}
        <AnimatePresence>
          {showSimulator && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <StatusCard result={displayResult.result} reasons={displayResult.reasons} />

              {/* Main Content Area */}
              <div className={`grid gap-6 ${expandedGraph ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-4"}`}>
                {/* Controls Panel */}
                {!expandedGraph && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1 space-y-4"
                  >
                    <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Controls
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowControls(!showControls)}
                            className="p-1"
                          >
                            {showControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </div>
                      </CardHeader>
                      {showControls && (
                        <CardContent className="space-y-4">
                          {/* What-If Toggle */}
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">What-If Mode</Label>
                            <Switch checked={whatIfMode} onCheckedChange={setWhatIfMode} />
                          </div>

                          {/* Scenario Selection */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Test Scenario</Label>
                            <Select
                              value={currentFixture}
                              onValueChange={(v) => setCurrentFixture(v as "blocked" | "allowed" | "custom")}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="blocked">Blocked Scenario</SelectItem>
                                <SelectItem value="allowed">Allowed Scenario</SelectItem>
                                <SelectItem value="custom">Custom Configuration</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* What-If Signers */}
                          {whatIfMode && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-2 border-t pt-3"
                            >
                              <Label className="text-sm font-medium">Simulate Signatures</Label>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {displayResult.approval_requirements.map((req) =>
                                  req.eligible_signers
                                    .filter((signer) => !req.satisfiers.some((s) => s.who === signer.id))
                                    .map((signer) => (
                                      <div key={signer.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`sim-${signer.id}`}
                                          checked={simulatedSigners.has(signer.id)}
                                          onCheckedChange={(checked) =>
                                            handleSimulatedSignerToggle(signer.id, checked as boolean)
                                          }
                                        />
                                        <Label htmlFor={`sim-${signer.id}`} className="text-xs flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          {signer.display_name}
                                        </Label>
                                      </div>
                                    )),
                                )}
                              </div>
                            </motion.div>
                          )}

                          {/* Export Actions */}
                          <div className="space-y-2 border-t pt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleExportJson}
                              className="w-full bg-transparent"
                            >
                              <Download className="w-3 h-3 mr-2" />
                              Export JSON
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                )}

                {/* Trust Graph */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={expandedGraph ? "col-span-1" : "lg:col-span-3"}
                >
                  <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Trust Graph Visualization
                          {whatIfMode && (
                            <Badge variant="secondary" className="text-xs">
                              Interactive Mode
                            </Badge>
                          )}
                          {currentFixture === "custom" && (
                            <Badge variant="outline" className="text-xs">
                              Custom Config
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {simulatedSigners.size > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {simulatedSigners.size} simulated
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedGraph(!expandedGraph)}
                            className="p-2"
                          >
                            {expandedGraph ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className={expandedGraph ? "h-[70vh]" : "h-[60vh]"}>
                        <TrustGraph
                          hint={displayResult.visualization_hint}
                          className="h-full"
                          simulatedSigners={simulatedSigners}
                          approvalRequirements={displayResult.approval_requirements}
                          focusedNodes={[]}
                          animatePulse={isProcessing}
                          onNodeClick={(nodeId) => {
                            const node = displayResult.visualization_hint.nodes.find((n) => n.id === nodeId)
                            if (node?.type === "person" && whatIfMode) {
                              handleSimulatedSignerToggle(nodeId, !simulatedSigners.has(nodeId))
                            }
                          }}
                        />
                      </div>
                      {whatIfMode && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-400">
                          <p className="text-sm text-blue-800 font-medium">
                            💡 Click on person nodes in the graph to simulate their signatures
                          </p>
                        </div>
                      )}
                      {currentFixture === "custom" && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-l-green-400">
                          <p className="text-sm text-green-800 font-medium">
                            🎯 Using your custom organization configuration with {customConfig.people.length} people and{" "}
                            {customConfig.roles.length} roles
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Detailed Results */}
              {!expandedGraph && (
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
                                            <AlertTriangle
                                              className="w-3 h-3 text-amber-500"
                                            />
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
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Glossary */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12">
          <Card className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} border-t-4 border-t-blue-500`}>
            <CardHeader>
              <CardTitle className="text-sm">Glossary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Root
                  </h4>
                  <p className="text-gray-600 text-xs">The ultimate authority that can delegate permissions</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Role
                  </h4>
                  <p className="text-gray-600 text-xs">A permission set that protects specific files or operations</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Attestation
                  </h4>
                  <p className="text-gray-600 text-xs">A signed approval tied to a specific change</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Threshold
                  </h4>
                  <p className="text-gray-600 text-xs">Minimum number of signatures required for approval</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Custom Config Dialog */}
      <Dialog open={showCustomConfig} onOpenChange={setShowCustomConfig}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Custom Organization Configuration</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="people" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="people">People & Signers</TabsTrigger>
              <TabsTrigger value="roles">Roles & Policies</TabsTrigger>
            </TabsList>

            <TabsContent value="people" className="space-y-4">
              {/* Add New Person */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add New Person
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      addPerson()
                    }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="person-id">ID</Label>
                        <Input
                          id="person-id"
                          value={newPersonForm.id}
                          onChange={(e) => setNewPersonForm({ ...newPersonForm, id: e.target.value })}
                          placeholder="e.g., john_doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="person-name">Display Name</Label>
                        <Input
                          id="person-name"
                          value={newPersonForm.display_name}
                          onChange={(e) => setNewPersonForm({ ...newPersonForm, display_name: e.target.value })}
                          placeholder="e.g., John Doe"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="person-keyid">Key ID</Label>
                        <Input
                          id="person-keyid"
                          value={newPersonForm.keyid}
                          onChange={(e) => setNewPersonForm({ ...newPersonForm, keyid: e.target.value })}
                          placeholder="Auto-generated if empty"
                        />
                      </div>
                      <div>
                        <Label htmlFor="person-keytype">Key Type</Label>
                        <Select
                          value={newPersonForm.key_type}
                          onValueChange={(v) => setNewPersonForm({ ...newPersonForm, key_type: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ssh">SSH</SelectItem>
                            <SelectItem value="gpg">GPG</SelectItem>
                            <SelectItem value="sigstore">Sigstore</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Person
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Existing People */}
              <div className="space-y-3">
                {customConfig.people.map((person) => (
                  <Card key={person.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{person.display_name}</span>
                            <Badge variant="outline">{person.key_type.toUpperCase()}</Badge>
                            {person.has_signed && <Badge className="bg-green-500">Signed</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePersonSigned(person.id)}
                            className={person.has_signed ? "bg-green-50" : ""}
                          >
                            {person.has_signed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {person.has_signed ? "Signed" : "Not Signed"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingPerson(person)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deletePerson(person.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        ID: {person.id} | Key: {person.keyid}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="roles" className="space-y-4">
              {/* Add New Role */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldPlus className="w-4 h-4" />
                    Add New Role
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      addRole()
                    }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="role-id">Role ID</Label>
                        <Input
                          id="role-id"
                          value={newRoleForm.id}
                          onChange={(e) => setNewRoleForm({ ...newRoleForm, id: e.target.value })}
                          placeholder="e.g., maintainer"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role-name">Display Name</Label>
                        <Input
                          id="role-name"
                          value={newRoleForm.display_name}
                          onChange={(e) => setNewRoleForm({ ...newRoleForm, display_name: e.target.value })}
                          placeholder="e.g., Maintainer"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="role-threshold">Signature Threshold</Label>
                        <Input
                          id="role-threshold"
                          type="number"
                          min="1"
                          value={newRoleForm.threshold}
                          onChange={(e) =>
                            setNewRoleForm({ ...newRoleForm, threshold: Number.parseInt(e.target.value) || 1 })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="role-globs">File Patterns</Label>
                        <Input
                          id="role-globs"
                          value={newRoleForm.file_globs.join(", ")}
                          onChange={(e) =>
                            setNewRoleForm({
                              ...newRoleForm,
                              file_globs: e.target.value.split(",").map((s) => s.trim()),
                            })
                          }
                          placeholder="e.g., src/**, docs/**"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Assigned People</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {customConfig.people.map((person) => (
                          <div key={person.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`assign-${person.id}`}
                              checked={newRoleForm.assigned_people.includes(person.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewRoleForm({
                                    ...newRoleForm,
                                    assigned_people: [...newRoleForm.assigned_people, person.id],
                                  })
                                } else {
                                  setNewRoleForm({
                                    ...newRoleForm,
                                    assigned_people: newRoleForm.assigned_people.filter((id) => id !== person.id),
                                  })
                                }
                              }}
                            />
                            <Label htmlFor={`assign-${person.id}`} className="text-sm">
                              {person.display_name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Role
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Existing Roles */}
              <div className="space-y-3">
                {customConfig.roles.map((role) => (
                  <Card key={role.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4" />
                          <span className="font-medium">{role.display_name}</span>
                          <Badge variant="outline">Threshold: {role.threshold}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingRole(role)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteRole(role.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">Files: {role.file_globs.join(", ")}</div>
                      <div className="text-sm text-gray-500">
                        People:{" "}
                        {role.assigned_people
                          .map((id) => customConfig.people.find((p) => p.id === id)?.display_name)
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Person Modal */}
      {editingPerson && (
        <Dialog open={!!editingPerson} onOpenChange={() => setEditingPerson(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Person: {editingPerson.display_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-person-name">Display Name</Label>
                <Input
                  id="edit-person-name"
                  value={editingPerson.display_name}
                  onChange={(e) => setEditingPerson({ ...editingPerson, display_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-person-keyid">Key ID</Label>
                <Input
                  id="edit-person-keyid"
                  value={editingPerson.keyid}
                  onChange={(e) => setEditingPerson({ ...editingPerson, keyid: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-person-keytype">Key Type</Label>
                <Select
                  value={editingPerson.key_type}
                  onValueChange={(v) => setEditingPerson({ ...editingPerson, key_type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ssh">SSH</SelectItem>
                    <SelectItem value="gpg">GPG</SelectItem>
                    <SelectItem value="sigstore">Sigstore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => updatePerson(editingPerson)} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Role Modal */}
      {editingRole && (
        <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Role: {editingRole.display_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-role-name">Display Name</Label>
                <Input
                  id="edit-role-name"
                  value={editingRole.display_name}
                  onChange={(e) => setEditingRole({ ...editingRole, display_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role-threshold">Signature Threshold</Label>
                <Input
                  id="edit-role-threshold"
                  type="number"
                  min="1"
                  value={editingRole.threshold}
                  onChange={(e) => setEditingRole({ ...editingRole, threshold: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role-globs">File Patterns</Label>
                <Input
                  id="edit-role-globs"
                  value={editingRole.file_globs.join(", ")}
                  onChange={(e) =>
                    setEditingRole({
                      ...editingRole,
                      file_globs: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                />
              </div>
              <div>
                <Label>Assigned People</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {customConfig.people.map((person) => (
                    <div key={person.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-assign-${person.id}`}
                        checked={editingRole.assigned_people.includes(person.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditingRole({
                              ...editingRole,
                              assigned_people: [...editingRole.assigned_people, person.id],
                            })
                          } else {
                            setEditingRole({
                              ...editingRole,
                              assigned_people: editingRole.assigned_people.filter((id) => id !== person.id),
                            })
                          }
                        }}
                      />
                      <Label htmlFor={`edit-assign-${person.id}`} className="text-sm">
                        {person.display_name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={() => updateRole(editingRole)} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
