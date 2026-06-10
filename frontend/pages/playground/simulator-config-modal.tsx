"use client"

import { UserPlus, Plus, Users, XCircle, CheckCircle, Edit, Trash2, ShieldPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { SimulatorState } from "@/hooks/use-gittuf-simulator"

interface SimulatorConfigModalProps {
  state: SimulatorState
}

export function SimulatorConfigModal({ state }: SimulatorConfigModalProps) {
  const {
    showCustomConfig,
    setShowCustomConfig,
    customConfig,
    newPersonForm,
    setNewPersonForm,
    newRoleForm,
    setNewRoleForm,
    setEditingPerson,
    addPerson,
    addRole,
    deletePerson,
    deleteRole,
    togglePersonSigned,
  } = state

  return (
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
                        onValueChange={(v) => setNewPersonForm({ ...newPersonForm, key_type: v as "ssh" | "gpg" | "sigstore" })}
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
                    <ShieldPlus className="w-4 h-4 mr-2" />
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
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <ShieldPlus className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{role.display_name}</span>
                        <Badge variant="secondary">Threshold: {role.threshold}</Badge>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => deleteRole(role.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>Files: {role.file_globs.join(", ")}</div>
                      <div>
                        Assigned:{" "}
                        {role.assigned_people
                          .map((pid) => customConfig.people.find((p) => p.id === pid)?.display_name)
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
