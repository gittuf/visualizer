"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Users, Shield, Key } from "lucide-react"
import type { VisualizationHint } from "@/lib/simulator-types"

interface TrustGraphProps {
  hint: VisualizationHint
  className?: string
  focusedNodes?: string[]
  animatePulse?: boolean
  onNodeClick?: (nodeId: string) => void
  simulatedSigners?: Set<string>
  approvalRequirements?: any[]
}

export function TrustGraph({
  hint,
  className = "",
  focusedNodes = [],
  animatePulse = false,
  onNodeClick,
  simulatedSigners = new Set(),
  approvalRequirements = [],
}: TrustGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<any>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [layoutApplied, setLayoutApplied] = useState(false)
  const [graphKey, setGraphKey] = useState(0)

  // Create enhanced nodes with status information - memoized to prevent unnecessary recalculations
  const enhancedNodes = useMemo(() => {
    return hint.nodes.map((node) => {
      let status = "inactive"
      let satisfied = false

      if (node.type === "person") {
        // Check if this person has signed
        const hasSigned = approvalRequirements.some((req) => req.satisfiers.some((s: any) => s.who === node.id))
        const isSimulated = simulatedSigners.has(node.id)

        if (hasSigned) {
          status = "signed"
          satisfied = true
        } else if (isSimulated) {
          status = "simulated"
          satisfied = true
        } else {
          status = "pending"
        }
      } else if (node.type === "role") {
        // Check if role requirements are satisfied
        const roleReq = approvalRequirements.find((req) => req.role === node.id)
        if (roleReq) {
          satisfied = roleReq.satisfied >= roleReq.threshold
          status = satisfied ? "satisfied" : "unsatisfied"
        }
      }

      return {
        ...node,
        status,
        satisfied,
      }
    })
  }, [hint.nodes, approvalRequirements, simulatedSigners])

  const getNodeColor = useCallback((type: string, status: string, isFocused: boolean) => {
    if (type === "role") {
      if (status === "satisfied") return isFocused ? "#059669" : "#10b981"
      if (status === "unsatisfied") return isFocused ? "#dc2626" : "#ef4444"
      return isFocused ? "#3b82f6" : "#6b7280"
    } else if (type === "person") {
      if (status === "signed") return isFocused ? "#059669" : "#10b981"
      if (status === "simulated") return isFocused ? "#0284c7" : "#0ea5e9"
      if (status === "pending") return isFocused ? "#d97706" : "#f59e0b"
      return isFocused ? "#7c3aed" : "#8b5cf6"
    }
    return isFocused ? "#374151" : "#6b7280"
  }, [])

  // Calculate initial positions for hierarchical layout
  const calculateInitialPositions = useCallback(() => {
    const positions: { [key: string]: { x: number; y: number } } = {}
    const container = containerRef.current
    if (!container) return positions

    const containerWidth = container.offsetWidth || 800
    const containerHeight = container.offsetHeight || 600

    // Separate nodes by type
    const roleNodes = enhancedNodes.filter((n) => n.type === "role")
    const personNodes = enhancedNodes.filter((n) => n.type === "person")
    const otherNodes = enhancedNodes.filter((n) => n.type !== "role" && n.type !== "person")

    // Position role nodes in the top tier
    const roleY = 120
    const roleSpacing = Math.min(200, (containerWidth - 200) / Math.max(1, roleNodes.length - 1))
    const roleStartX = (containerWidth - (roleNodes.length - 1) * roleSpacing) / 2

    roleNodes.forEach((node, index) => {
      positions[node.id] = {
        x: roleStartX + index * roleSpacing,
        y: roleY,
      }
    })

    // Position person nodes in lower tiers based on their role connections
    const personY = 320
    const personSpacing = Math.min(150, (containerWidth - 200) / Math.max(1, personNodes.length - 1))
    const personStartX = (containerWidth - (personNodes.length - 1) * personSpacing) / 2

    personNodes.forEach((node, index) => {
      // Try to position people below their connected roles
      const connectedRoles = hint.edges
        .filter((edge) => edge.from === node.id)
        .map((edge) => edge.to)
        .filter((roleId) => roleNodes.some((r) => r.id === roleId))

      if (connectedRoles.length > 0) {
        // Position below the average x of connected roles
        const avgX =
          connectedRoles.reduce((sum, roleId) => {
            const rolePos = positions[roleId]
            return sum + (rolePos ? rolePos.x : personStartX + index * personSpacing)
          }, 0) / connectedRoles.length

        positions[node.id] = {
          x: avgX + (Math.random() - 0.5) * 60, // Add slight randomness
          y: personY + (index % 2) * 80, // Stagger vertically
        }
      } else {
        // Default positioning
        positions[node.id] = {
          x: personStartX + index * personSpacing,
          y: personY,
        }
      }
    })

    // Position other nodes
    otherNodes.forEach((node, index) => {
      positions[node.id] = {
        x: 100 + index * 150,
        y: 500,
      }
    })

    return positions
  }, [enhancedNodes, hint.edges])

  const initializeGraph = useCallback(async () => {
    if (!containerRef.current || typeof window === "undefined") return

    const container = containerRef.current
    if (!container || !container.offsetWidth || !container.offsetHeight) {
      console.warn("Container not ready for graph initialization")
      return
    }

    setIsLoading(true)
    setLayoutApplied(false)

    try {
      const cytoscape = (await import("cytoscape")).default

      if (cyRef.current) {
        cyRef.current.destroy()
      }

      const initialPositions = calculateInitialPositions()

      const cy = cytoscape({
        container: containerRef.current,
        elements: [
          ...enhancedNodes.map((node) => ({
            data: {
              id: node.id,
              label: node.label,
              type: node.type,
              status: node.status,
              satisfied: node.satisfied,
              ...node.meta,
            },
            position: initialPositions[node.id] || { x: 100, y: 100 },
          })),
          ...hint.edges.map((edge) => ({
            data: {
              id: `${edge.from}-${edge.to}`,
              source: edge.from,
              target: edge.to,
              label: edge.label,
              satisfied: edge.satisfied,
            },
          })),
        ],
        style: [
          {
            selector: "node",
            style: {
              "background-color": (ele: any) => {
                const type = ele.data("type")
                const status = ele.data("status")
                const isFocused = focusedNodes.includes(ele.data("id"))
                return getNodeColor(type, status, isFocused)
              },
              label: "data(label)",
              "text-valign": "center",
              "text-halign": "center",
              color: "#ffffff",
              "font-size": "12px",
              "font-weight": "600",
              "text-wrap": "wrap",
              "text-max-width": "80px",
              width: (ele: any) => {
                const type = ele.data("type")
                return type === "role" ? "80px" : "60px"
              },
              height: (ele: any) => {
                const type = ele.data("type")
                return type === "role" ? "80px" : "60px"
              },
              shape: (ele: any) => {
                const type = ele.data("type")
                if (type === "role") return "hexagon"
                if (type === "person") return "ellipse"
                return "rectangle"
              },
              "border-width": (ele: any) => {
                const isFocused = focusedNodes.includes(ele.data("id"))
                const isSelected = selectedNode === ele.data("id")
                return isSelected ? "4px" : isFocused ? "3px" : "2px"
              },
              "border-color": (ele: any) => {
                const isSelected = selectedNode === ele.data("id")
                const isFocused = focusedNodes.includes(ele.data("id"))
                if (isSelected) return "#fbbf24"
                if (isFocused) return "#ffffff"
                return "rgba(255, 255, 255, 0.8)"
              },
              "transition-property": "background-color, border-color, border-width",
              "transition-duration": "0.3s",
            },
          },
          {
            selector: "edge",
            style: {
              width: (ele: any) => (ele.data("satisfied") ? "4px" : "2px"),
              "line-color": (ele: any) => (ele.data("satisfied") ? "#10b981" : "#ef4444"),
              "target-arrow-color": (ele: any) => (ele.data("satisfied") ? "#10b981" : "#ef4444"),
              "target-arrow-shape": "triangle",
              "target-arrow-size": "10px",
              "curve-style": "bezier",
              "control-point-step-size": "60px",
              label: "data(label)",
              "font-size": "10px",
              "font-weight": "600",
              color: "#374151",
              "text-background-color": "#ffffff",
              "text-background-opacity": 0.9,
              "text-background-padding": "4px",
              "text-background-shape": "roundrectangle",
              "line-style": (ele: any) => (ele.data("satisfied") ? "solid" : "dashed"),
              "transition-property": "line-color, target-arrow-color, width",
              "transition-duration": "0.3s",
            },
          },
        ],
        zoomingEnabled: true,
        userZoomingEnabled: true,
        panningEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
        selectionType: "single",
        minZoom: 0.2,
        maxZoom: 3,
      })

      // Event handlers
      cy.on("tap", "node", (evt: any) => {
        const nodeId = evt.target.data("id")
        setSelectedNode(nodeId)
        onNodeClick?.(nodeId)
      })

      cy.on("tap", (evt: any) => {
        if (evt.target === cy) {
          setSelectedNode(null)
        }
      })

      cyRef.current = cy

      // Fit the graph to the container with some padding
      setTimeout(() => {
        if (cyRef.current) {
          cyRef.current.fit(undefined, 50)
          setLayoutApplied(true)
          setIsLoading(false)
        }
      }, 200)

      // Simple pulse animation
      if (animatePulse) {
        setTimeout(() => {
          const pulseNodes = () => {
            if (!cyRef.current) return

            enhancedNodes.forEach((node, index) => {
              setTimeout(() => {
                if (cyRef.current) {
                  const cyNode = cyRef.current.getElementById(node.id)
                  if (cyNode && cyNode.length > 0) {
                    cyNode.style({
                      "border-width": "6px",
                      "border-color": "#fbbf24",
                    })

                    setTimeout(() => {
                      if (cyRef.current) {
                        const cyNodeReset = cyRef.current.getElementById(node.id)
                        if (cyNodeReset && cyNodeReset.length > 0) {
                          cyNodeReset.style({
                            "border-width": "2px",
                            "border-color": "rgba(255, 255, 255, 0.8)",
                          })
                        }
                      }
                    }, 600)
                  }
                }
              }, index * 200)
            })
          }

          pulseNodes()
        }, 800)
      }
    } catch (error) {
      console.error("Failed to initialize graph:", error)
      setIsLoading(false)
    }
  }, [
    enhancedNodes,
    hint.edges,
    getNodeColor,
    calculateInitialPositions,
    animatePulse,
    onNodeClick,
    focusedNodes,
    selectedNode,
  ])

  // Force re-initialization when hint changes significantly
  useEffect(() => {
    setGraphKey((prev) => prev + 1)
    initializeGraph()

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
        cyRef.current = null
      }
    }
  }, [hint.nodes.length, hint.edges.length])

  // Separate effect for updating existing graph without re-creating it
  useEffect(() => {
    if (!cyRef.current || !layoutApplied) return

    try {
      // Update node styles without recreating the graph
      cyRef.current.nodes().forEach((node: any) => {
        const nodeData = enhancedNodes.find((n) => n.id === node.data("id"))
        if (nodeData) {
          node.data("status", nodeData.status)
          node.data("satisfied", nodeData.satisfied)

          // Update the background color directly
          const isFocused = focusedNodes.includes(node.data("id"))
          const newColor = getNodeColor(nodeData.type, nodeData.status, isFocused)
          node.style("background-color", newColor)
        }
      })
    } catch (error) {
      console.error("Failed to update graph:", error)
    }
  }, [simulatedSigners, approvalRequirements, enhancedNodes, focusedNodes, getNodeColor, layoutApplied])

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      if (cyRef.current && layoutApplied) {
        setTimeout(() => {
          if (cyRef.current) {
            cyRef.current.fit(undefined, 50)
          }
        }, 100)
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [layoutApplied])

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2)
    }
  }

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8)
    }
  }

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 40)
      setSelectedNode(null)
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "role":
        return <Shield className="w-3 h-3" />
      case "person":
        return <Users className="w-3 h-3" />
      case "key":
        return <Key className="w-3 h-3" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-500"
      case "simulated":
        return "bg-blue-500"
      case "satisfied":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "unsatisfied":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div
      key={graphKey}
      className={`relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden ${className}`}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
          />
          <span className="ml-3 text-sm text-gray-600">Building trust graph...</span>
        </div>
      )}

      {/* Graph container */}
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: "400px" }} />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="sm" variant="outline" onClick={handleZoomIn} className="bg-white shadow-md">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleZoomOut} className="bg-white shadow-md">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset} className="bg-white shadow-md">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
        <h4 className="text-xs font-semibold mb-2">Legend</h4>
        <div className="space-y-1">
          {enhancedNodes
            .reduce((acc, node) => {
              const key = `${node.type}-${node.status}`
              if (!acc.some((item) => item.key === key)) {
                acc.push({
                  key,
                  type: node.type,
                  status: node.status,
                  label:
                    node.status === "signed"
                      ? "Signed"
                      : node.status === "simulated"
                        ? "Simulated"
                        : node.status === "satisfied"
                          ? "Satisfied"
                          : node.status === "pending"
                            ? "Pending"
                            : node.status === "unsatisfied"
                              ? "Unsatisfied"
                              : "Inactive",
                })
              }
              return acc
            }, [] as any[])
            .map((item) => (
              <div key={item.key} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                <span className="flex items-center gap-1">
                  {getNodeIcon(item.type)}
                  {item.label}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Selected node info */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border max-w-xs"
        >
          {(() => {
            const node = enhancedNodes.find((n) => n.id === selectedNode)
            if (!node) return null

            return (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getNodeIcon(node.type)}
                  <span className="font-semibold text-sm">{node.label}</span>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(node.status)} text-white border-0`}>
                    {node.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600">
                  <div>Type: {node.type}</div>
                  {node.type === "person" && (
                    <div>
                      {simulatedSigners.has(node.id)
                        ? "Simulated signer"
                        : approvalRequirements.some((req) => req.satisfiers.some((s: any) => s.who === node.id))
                          ? "Has signed"
                          : "Eligible signer"}
                    </div>
                  )}
                  {node.type === "role" && (
                    <div>
                      {(() => {
                        const roleReq = approvalRequirements.find((req) => req.role === node.id)
                        return roleReq ? `${roleReq.satisfied}/${roleReq.threshold} signatures` : "Role requirements"
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </motion.div>
      )}
    </div>
  )
}
