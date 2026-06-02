import type { StaticImageData } from "next/image";
import type { RepositoryInfo } from "@/lib/repository-handler";
import type { DemoVisualizerData } from "@/lib/demo-visualizer-data";

export type WorkspacePanelId =
  | "graph-source"
  | "policy-query"
  | "history"
  | "compare"
  | "metadata"
  | "settings";

export interface VisualizerWorkspaceProps {
  repository: RepositoryInfo;
  workspaceData?: DemoVisualizerData | null;
  isLoading: boolean;
  onReload: () => void;
  onDisconnect: () => void;
}

export interface GraphInstance {
  id: string;
  offset: {
    x: number;
    y: number;
  };
}

export interface GraphWorkspaceTab {
  id: string;
  label: string;
  closable?: boolean;
  editable?: boolean;
  graphs: GraphInstance[];
}

export interface WorkspaceMenuItemConfig {
  id: WorkspacePanelId;
  label: string;
  icon: StaticImageData;
}
