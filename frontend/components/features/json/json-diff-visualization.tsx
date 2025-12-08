"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
} from "reactflow"
import "reactflow/dist/style.css"
import dagre from "dagre"
import { motion } from "framer-motion"
import { CollapsibleCard } from "@/components/shared/collapsible-card"
import { compareJsonObjects, type DiffEntry, type DiffResult } from "@/lib/json-diff"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { formatJsonValue, getNodeTypeDescription } from "@/lib/json-utils"
import type { JsonValue, JsonObject } from "@/lib/types"
import type { ViewMode } from "@/lib/view-mode-utils"

// Node dimensions for layout
const NODE_WIDTH = 220
const NODE_HEIGHT = 80

// Animated node wrapper
const AnimatedNode = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  )
}

interface DiffNodeData {
  label?: string
  value?: JsonValue
  oldValue?: JsonValue
  newValue?: JsonValue
  path?: string
  isExpanded?: boolean
  onToggle?: () => void
  metadata?: Record<string, JsonValue>
  diffDetails?: string
}

// Node tooltip wrapper
const DiffNodeTooltip = ({ children, data, type }: { children: React.ReactNode; data: DiffNodeData; type: string }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right" className="max-w-md p-0 overflow-hidden">
          <div className="bg-white rounded-md shadow-lg border border-slate-200">
            <div className="bg-slate-50 p-2 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-slate-700">
                  {data.label || (type === "diffRoot" ? "Root" : "Node")}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    type === "diffAdded"
                      ? "bg-green-50 text-green-700"
                      : type === "diffRemoved"
                        ? "bg-red-50 text-red-700"
                        : type === "diffChanged"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100"
                  }`}
                >
                  {getNodeTypeDescription(type)}
                </Badge>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {data.path && (
                <div>
                  <span className="text-xs font-medium text-slate-500">Path:</span>
                  <code className="ml-2 text-xs bg-slate-50 px-1 py-0.5 rounded">{data.path}</code>
                </div>
              )}

              {type === "diffChanged" ? (
                <>
                  <div>
                    <span className="text-xs font-medium text-red-500">Old Value:</span>
                    <div className="mt-1 text-xs bg-red-50 p-2 rounded border border-red-200 max-h-[100px] overflow-auto">
                      <pre className="whitespace-pre-wrap break-all">{formatJsonValue(data.oldValue)}</pre>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-green-500">New Value:</span>
                    <div className="mt-1 text-xs bg-green-50 p-2 rounded border border-green-200 max-h-[100px] overflow-auto">
                      <pre className="whitespace-pre-wrap break-all">{formatJsonValue(data.newValue)}</pre>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <span className="text-xs font-medium text-slate-500">Value:</span>
                  <div
                    className={`mt-1 text-xs p-2 rounded border max-h-[200px] overflow-auto ${
                      type === "diffAdded"
                        ? "bg-green-50 border-green-200"
                        : type === "diffRemoved"
                          ? "bg-red-50 border-red-200"
                          : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <pre className="whitespace-pre-wrap break-all">{formatJsonValue(data.value)}</pre>
                  </div>
                </div>
              )}

              {data.metadata && Object.keys(data.metadata).length > 0 && (
                <div>
                  <span className="text-xs font-medium text-slate-500">Metadata:</span>
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    {Object.entries(data.metadata).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {type === "diffChanged" && data.diffDetails && (
                <div>
                  <span className="text-xs font-medium text-slate-500">Change Details:</span>
                  <div className="mt-1 text-xs bg-slate-50 p-2 rounded border border-slate-200">{data.diffDetails}</div>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Node types
function DiffRootNode({ data, isConnectable }: { data: DiffNodeData; isConnectable: boolean }) {
  return (
    <AnimatedNode>
      <DiffNodeTooltip data={data} type="diffRoot">
        <CollapsibleCard
          title={data.label || "Root"}
          isExpanded={data.isExpanded}
          onToggle={data.onToggle}
          className="w-[220px] border-slate-400 bg-slate-50"
          headerClassName="bg-slate-100"
        >
          <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!bg-slate-500" />
        </CollapsibleCard>
      </DiffNodeTooltip>
    </AnimatedNode>
  )
}

function DiffAddedNode({ data, isConnectable }: { data: DiffNodeData; isConnectable: boolean }) {
  return (
    <AnimatedNode>
      <DiffNodeTooltip data={data} type="diffAdded">
        <CollapsibleCard
          title={data.label || "Added"}
          isExpanded={data.isExpanded}
          onToggle={data.onToggle}
          className="w-[220px] border-green-200 bg-green-50"
          headerClassName="bg-green-100 text-green-800"
        >
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            className="!bg-green-500 !w-3 !h-3"
          />
          <div className="p-2 text-xs font-mono text-green-700 bg-green-50/50 rounded mt-1 truncate">
            {formatJsonValue(data.value)}
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            className="!bg-green-500 !w-3 !h-3"
          />
        </CollapsibleCard>
      </DiffNodeTooltip>
    </AnimatedNode>
  )
}

function DiffRemovedNode({ data, isConnectable }: { data: DiffNodeData; isConnectable: boolean }) {
  return (
    <AnimatedNode>
      <DiffNodeTooltip data={data} type="diffRemoved">
        <div className="w-[220px] rounded-md border border-red-200 bg-red-50 shadow-sm relative group hover:shadow-md transition-shadow">
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            className="!bg-red-500 !w-3 !h-3"
          />
          <div className="p-3">
            <div className="font-medium text-sm text-red-800 mb-1 truncate">{data.label}</div>
            <div className="text-xs font-mono text-red-600 bg-red-100/50 p-1 rounded truncate">
              {formatJsonValue(data.value)}
            </div>
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            className="!bg-red-500 !w-3 !h-3"
          />
        </div>
      </DiffNodeTooltip>
    </AnimatedNode>
  )
}

function DiffChangedNode({ data, isConnectable }: { data: DiffNodeData; isConnectable: boolean }) {
  return (
    <AnimatedNode>
      <DiffNodeTooltip data={data} type="diffChanged">
        <div className="w-[220px] rounded-md border border-amber-200 bg-amber-50 shadow-sm relative group hover:shadow-md transition-shadow">
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            className="!bg-amber-500 !w-3 !h-3"
          />
          <div className="p-3">
            <div className="font-medium text-sm text-amber-800 mb-2 truncate">{data.label}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-red-100/50 p-1 rounded border border-red-100">
                <div className="font-xs text-red-500 mb-0.5">Old</div>
                <div className="font-mono text-red-700 truncate">{formatJsonValue(data.oldValue)}</div>
              </div>
              <div className="bg-green-100/50 p-1 rounded border border-green-100">
                <div className="font-xs text-green-500 mb-0.5">New</div>
                <div className="font-mono text-green-700 truncate">{formatJsonValue(data.newValue)}</div>
              </div>
            </div>
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            className="!bg-amber-500 !w-3 !h-3"
          />
        </div>
      </DiffNodeTooltip>
    </AnimatedNode>
  )
}

function DiffUnchangedNode({ data, isConnectable }: { data: DiffNodeData; isConnectable: boolean }) {
  return (
    <AnimatedNode>
      <DiffNodeTooltip data={data} type="diffUnchanged">
        <div className="w-[220px]">
          <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
          <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
          <CollapsibleCard
            title={data.label || ""}
            isOpen={true}
            borderColor="border-slate-300"
            onToggle={data.onToggle}
            isExpanded={data.isExpanded}
          >
            <div className="text-xs">
              {typeof data.value === "object" && data.value !== null
                ? `Object with ${Object.keys(data.value).length} properties`
                : data.value === null
                  ? "null"
                  : data.value === undefined
                    ? "undefined"
                    : String(data.value ?? "undefined")}
            </div>
          </CollapsibleCard>
        </div>
      </DiffNodeTooltip>
    </AnimatedNode>
  )
}

const nodeTypes = {
  diffRoot: DiffRootNode,
  diffAdded: DiffAddedNode,
  diffRemoved: DiffRemovedNode,
  diffChanged: DiffChangedNode,
  diffUnchanged: DiffUnchangedNode,
}

// Layout configuration
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const isHorizontal = direction === "LR"
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = node
    const { x, y } = dagreGraph.node(node.id)

    nodeWithPosition.position = {
      x: isHorizontal ? x - NODE_WIDTH / 2 : x - NODE_WIDTH / 2,
      y: isHorizontal ? y - NODE_HEIGHT / 2 : y - NODE_HEIGHT / 2,
    }

    return nodeWithPosition
  })

  return { nodes: layoutedNodes, edges }
}

// Main component
export interface JsonDiffVisualizationProps {
  baseData: JsonObject | null
  compareData: JsonObject | null
  className?: string
  viewMode?: ViewMode
}

export default function JsonDiffVisualization({
  baseData,
  compareData,
  className,
  viewMode,
}: JsonDiffVisualizationProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [showUnchanged, setShowUnchanged] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const onConnect = useCallback((params: Edge | any) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }))
  }, [])

  // Process JSON data into nodes and edges
  useEffect(() => {
    if (!baseData || !compareData) return

    try {
      const newNodes: Node[] = []
      const newEdges: Edge[] = []
      let nodeId = 0

      // Add root node
      const rootId = `node-${nodeId++}`
      newNodes.push({
        id: rootId,
        type: "diffRoot",
        position: { x: 0, y: 0 },
        data: {
          value: compareData,
          isExpanded: true,
          onToggle: () => toggleNodeExpansion(rootId),
          path: "$",
          metadata: {
            type: typeof compareData,
            schemaVersion: (compareData as any)?.schemaVersion || "N/A",
          },
        },
      })

      // Compare the two JSON objects
      const diff = compareJsonObjects(baseData, compareData)

      if (!diff) {
        setNodes(getLayoutedElements(newNodes, newEdges, "TB").nodes)
        setEdges(newEdges)
        return
      }

      // Helper function to process added objects recursively
      const processAddedObject = (parentId: string, obj: JsonObject | any[], path: string, level: number) => {
        Object.entries(obj).forEach(([childKey, childValue]) => {
          const childId = `node-${nodeId++}`
          const childPath = `${path}.${childKey}`

          newNodes.push({
            id: childId,
            type: "diffAdded",
            position: { x: 0, y: level * 100 },
            data: {
              label: childKey,
              value: childValue as JsonValue,
              isExpanded: false,
              path: childPath,
              metadata: {
                type:
                  typeof childValue === "object"
                    ? Array.isArray(childValue)
                      ? "array"
                      : "object"
                    : typeof childValue,
              },
            },
          })

          newEdges.push({
            id: `edge-${parentId}-${childId}`,
            source: parentId,
            target: childId,
            animated: false,
            style: { stroke: "#22c55e" },
          })

          if (typeof childValue === "object" && childValue !== null) {
            processAddedObject(childId, childValue, childPath, level + 1)
          }
        })
      }

      // Helper function to process removed objects recursively
      const processRemovedObject = (parentId: string, obj: JsonObject | any[], path: string, level: number) => {
        Object.entries(obj).forEach(([childKey, childValue]) => {
          const childId = `node-${nodeId++}`
          const childPath = `${path}.${childKey}`

          newNodes.push({
            id: childId,
            type: "diffRemoved",
            position: { x: 0, y: level * 100 },
            data: {
              label: childKey,
              value: childValue as JsonValue,
              isExpanded: false,
              path: childPath,
              metadata: {
                type:
                  typeof childValue === "object"
                    ? Array.isArray(childValue)
                      ? "array"
                      : "object"
                    : typeof childValue,
              },
            },
          })

          newEdges.push({
            id: `edge-${parentId}-${childId}`,
            source: parentId,
            target: childId,
            animated: false,
            style: { stroke: "#ef4444" },
          })

          if (typeof childValue === "object" && childValue !== null) {
            processRemovedObject(childId, childValue, childPath, level + 1)
          }
        })
      }

      // Process diff recursively
      const processDiff = (parentId: string, diffObj: DiffResult, path = "$", level = 1) => {
        Object.entries(diffObj).forEach(([key, value]) => {
          const currentId = `node-${nodeId++}`
          const currentPath = path === "$" ? `${path}.${key}` : `${path}.${key}`
          const isExpanded = expandedNodes[currentId] !== false

          if (value.status === "added") {
            newNodes.push({
              id: currentId,
              type: "diffAdded",
              position: { x: 0, y: level * 100 },
              data: {
                label: key,
                value: value.value,
                isExpanded,
                onToggle: () => toggleNodeExpansion(currentId),
                path: currentPath,
                metadata: {
                  type:
                    typeof value.value === "object"
                      ? Array.isArray(value.value)
                        ? "array"
                        : "object"
                      : typeof value.value,
                  addedAt: new Date().toISOString(),
                },
              },
            })

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: true,
              style: { stroke: "#22c55e" },
            })

            if (isExpanded && typeof value.value === "object" && value.value !== null) {
              // For added objects, create nodes for their properties
              const addedObj = value.value as JsonObject | any[]
              processAddedObject(currentId, addedObj, currentPath, level + 1)
            }
          } else if (value.status === "removed") {
            newNodes.push({
              id: currentId,
              type: "diffRemoved",
              position: { x: 0, y: level * 100 },
              data: {
                label: key,
                value: value.value,
                isExpanded,
                onToggle: () => toggleNodeExpansion(currentId),
                path: currentPath,
                metadata: {
                  type:
                    typeof value.value === "object"
                      ? Array.isArray(value.value)
                        ? "array"
                        : "object"
                      : typeof value.value,
                  removedAt: new Date().toISOString(),
                },
              },
            })

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: true,
              style: { stroke: "#ef4444" },
            })

            if (isExpanded && typeof value.value === "object" && value.value !== null) {
              // For removed objects, create nodes for their properties
              const removedObj = value.value as JsonObject | any[]
              processRemovedObject(currentId, removedObj, currentPath, level + 1)
            }
          } else if (value.status === "changed") {
            // Generate a human-readable description of the change
            let diffDetails = "Value changed"
            if (typeof value.oldValue === "string" && typeof value.value === "string") {
              if (value.oldValue.length !== value.value.length) {
                diffDetails = `Length changed from ${value.oldValue.length} to ${value.value.length} characters`
              }
            } else if (typeof value.oldValue !== typeof value.value) {
              diffDetails = `Type changed from ${typeof value.oldValue} to ${typeof value.value}`
            }

            newNodes.push({
              id: currentId,
              type: "diffChanged",
              position: { x: 0, y: level * 100 },
              data: {
                label: key,
                oldValue: value.oldValue,
                newValue: value.value,
                isExpanded,
                onToggle: () => toggleNodeExpansion(currentId),
                path: currentPath,
                metadata: {
                  oldType: typeof value.oldValue,
                  newType: typeof value.value,
                  changedAt: new Date().toISOString(),
                },
                diffDetails,
              },
            })

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: true,
              style: { stroke: "#f59e0b" },
            })
          } else if (value.status === "unchanged" && showUnchanged) {
            newNodes.push({
              id: currentId,
              type: "diffUnchanged",
              position: { x: 0, y: level * 100 },
              data: {
                label: key,
                value: value.value,
                isExpanded,
                onToggle: () => toggleNodeExpansion(currentId),
                path: currentPath,
                metadata: {
                  type:
                    typeof value.value === "object"
                      ? Array.isArray(value.value)
                        ? "array"
                        : "object"
                      : typeof value.value,
                },
              },
            })

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: false,
              style: { stroke: "#94a3b8" },
            })

            if (isExpanded && typeof value.value === "object" && value.value !== null && value.children) {
              processDiff(currentId, value.children, currentPath, level + 1)
            }
          } else if (value.children) {
            // This is a nested object with changes inside, but the node itself is "unchanged"
            // (checked above). If we are here, it means showUnchanged is false (otherwise caught above),
            // OR the status was not added/removed/changed. 
            // Since we previously checked added/removed/changed, status is strictly "unchanged".
            
            // We usually want to show nodes that contain changes even if "showUnchanged" is false?
            // If showUnchanged is false, the previous block skipped it. 
            // So this block executes for unchanged nodes with children.
            // But if we want to hide unchanged nodes, we shouldn't render this node?
            // However, if children have changes, we probably MUST render this node to maintain the tree.
            
            const nodeType = "diffUnchanged"

            newNodes.push({
              id: currentId,
              type: nodeType,
              position: { x: 0, y: level * 100 },
              data: {
                label: key,
                value: value.value || {},
                isExpanded,
                onToggle: () => toggleNodeExpansion(currentId),
                path: currentPath,
                metadata: {
                  type:
                    typeof value.value === "object"
                      ? Array.isArray(value.value)
                        ? "array"
                        : "object"
                      : typeof value.value,
                  hasNestedChanges: true,
                },
              },
            })

            const edgeColor = "#94a3b8"

            newEdges.push({
              id: `edge-${parentId}-${currentId}`,
              source: parentId,
              target: currentId,
              animated: false,
              style: { stroke: edgeColor },
            })

            if (isExpanded) {
              processDiff(currentId, value.children, currentPath, level + 1)
            }
          }
        })
      }

      // Check if diff is a single entry (e.g., entire object added/removed) or a Result Record
      if ('status' in diff && typeof (diff as DiffEntry).status === 'string') {
        const diffEntry = diff as DiffEntry;
        // If the whole thing is added, we iterate its value if it's an object
        if (diffEntry.status === "added" && typeof diffEntry.value === "object" && diffEntry.value !== null) {
           processAddedObject(rootId, diffEntry.value as JsonObject | any[], "$", 1);
        } else if (diffEntry.status === "removed" && typeof diffEntry.value === "object" && diffEntry.value !== null) {
           processRemovedObject(rootId, diffEntry.value as JsonObject | any[], "$", 1);
        }
        // Handle other cases if necessary (e.g. root changed type)
      } else {
         // Start processing from root as a DiffResult
        processDiff(rootId, diff as DiffResult, "$")
      }

      // Apply layout
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        newNodes,
        newEdges,
        "TB", // Top to Bottom layout
      )

      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
      setError(null)
    } catch (err) {
      console.error("Error processing diff data:", err)
      setError("Failed to process comparison data. Please try again.")
    }
  }, [baseData, compareData, expandedNodes, toggleNodeExpansion, showUnchanged])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="bottom-left"
      minZoom={0.2}
      maxZoom={1.5}
    >
      <Background color="#f1f5f9" gap={16} size={1} />
      <MiniMap
        nodeStrokeColor={(n) => {
          if (n.type === "diffAdded") return "#22c55e"
          if (n.type === "diffRemoved") return "#ef4444"
          if (n.type === "diffChanged") return "#f59e0b"
          return "#94a3b8"
        }}
        nodeColor={(n) => {
          if (n.type === "diffAdded") return "#dcfce7"
          if (n.type === "diffRemoved") return "#fee2e2"
          if (n.type === "diffChanged") return "#fef3c7"
          return "#f1f5f9"
        }}
      />
      <Controls />
      <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md z-10">
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={showUnchanged}
            onChange={(e) => setShowUnchanged(e.target.checked)}
            className="mr-2"
          />
          Show unchanged nodes
        </label>
      </div>
      {error && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-700 px-4 py-2 rounded-md shadow-md z-10">
          {error}
        </div>
      )}
    </ReactFlow>
  )
}
