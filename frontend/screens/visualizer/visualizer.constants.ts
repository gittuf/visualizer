import compareIcon from "@/assets/compare.png";
import graphSourceIcon from "@/assets/graph-source.png";
import historyIcon from "@/assets/history.png";
import metadataIcon from "@/assets/metadata.png";
import policyQueryIcon from "@/assets/policy-query.png";
import settingsIcon from "@/assets/Settings.png";
import type { WorkspaceMenuItemConfig } from "@/screens/visualizer/visualizer.types";

export const historyTabId = "history-tab";
export const compareTabId = "compare-tab";

export const visualizerMenuItems: WorkspaceMenuItemConfig[] = [
  { id: "graph-source", label: "Graph Source", icon: graphSourceIcon },
  { id: "policy-query", label: "Policy Query", icon: policyQueryIcon },
  { id: "history", label: "History", icon: historyIcon },
  { id: "compare", label: "Compare", icon: compareIcon },
  { id: "metadata", label: "MetaData", icon: metadataIcon },
  { id: "settings", label: "Settings", icon: settingsIcon },
];
