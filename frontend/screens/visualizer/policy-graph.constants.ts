import type {
  PolicyGraphCanvasVariant,
  PolicyGraphChangeStatus,
  PolicyGraphLane,
} from "@/screens/visualizer/policy-graph.types";

export const layoutWidth = 980;
export const layoutHeight = 980;
export const boundary = { x: 80, y: 60, width: 820, height: 840 };
export const rowY = {
  branch: 120,
  file: 300,
  role: 500,
  principals: 760,
};
export const defaultLanes: PolicyGraphLane[] = [
  {
    key: "left",
    pathLabel: "src/**",
    roleLabel: "Authorized users",
    approvals: "Requires: 2 approvals",
  },
  {
    key: "right",
    pathLabel: "docs/**",
    roleLabel: "Authorized users",
    approvals: "Requires: 2 approvals",
  },
];
export const defaultPrincipalNames = ["Alice", "Carol", "Bob"];
export const branchBox = { width: 140, height: 92 };
export const fileBox = { width: 120, height: 118 };
export const roleBox = { width: 180, height: 132 };
export const principalBox = { width: 92, height: 108 };
export const scrollPadding = 96;

export const DIFF_COLORS = {
  unchanged: {
    text: "text-black",
    icon: "text-black",
    edge: "var(--tertiary-color)",
  },
  added: {
    text: "text-green-500",
    icon: "text-green-500",
    edge: "var(--approve-color)",
  },
  removed: {
    text: "text-red-500",
    icon: "text-red-500",
    edge: "var(--reject-color)",
  },
  modified: {
    text: "text-blue-500",
    icon: "text-blue-500",
    edge: "var(--modified-color)",
  },
} as const satisfies Record<
  PolicyGraphChangeStatus,
  {
    text: string;
    icon: string;
    edge: string;
  }
>;

export const defaultPolicyGraphVariant: Required<
  Pick<PolicyGraphCanvasVariant, "repositoryLabel" | "repositoryLabelColor" | "branchLabel">
> = {
  repositoryLabel: "gittuf_repo",
  repositoryLabelColor: "var(--dark-gray)",
  branchLabel: "Branch: main",
};
