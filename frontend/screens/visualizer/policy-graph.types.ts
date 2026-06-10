export type PolicyGraphChangeStatus =
  | "added"
  | "removed"
  | "modified"
  | "unchanged";

export interface PolicyGraphPrincipal {
  name: string;
  status?: PolicyGraphChangeStatus;
}

export interface PolicyGraphLane {
  key: string;
  pathLabel: string;
  roleLabel: string;
  approvals: string;
  branchStatus?: PolicyGraphChangeStatus;
  status?: PolicyGraphChangeStatus;
  pathStatus?: PolicyGraphChangeStatus;
  roleStatus?: PolicyGraphChangeStatus;
  approvalsStatus?: PolicyGraphChangeStatus;
  principals?: PolicyGraphPrincipal[];
}

export interface PolicyGraphCanvasVariant {
  repositoryLabel?: string;
  branchLabel?: string;
  lanes?: PolicyGraphLane[];
  principalNames?: string[];
  boundaryFill?: string;
  repositoryLabelColor?: string;
  showCompareLegend?: boolean;
}

export interface PolicyGraphEdge {
  d: string;
  arrow: boolean;
  changeType: PolicyGraphChangeStatus;
}
