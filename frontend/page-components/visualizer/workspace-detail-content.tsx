"use client";

import { useState } from "react";
import type { DemoVisualizerData } from "@/lib/demo-visualizer-data";
import { demoVisualizerData } from "@/lib/demo-visualizer-data";
import type { RepositoryInfo } from "@/lib/repository-handler";
import {
  DetailPanelCompare,
  DetailPanelGraphSource,
  DetailPanelHistory,
  DetailPanelMetadata,
  DetailPanelPolicyQuery,
  DetailPanelSettings,
} from "@/page-components/visualizer/detail/workspace-detail-panels";
import type { WorkspacePanelId } from "@/page-components/visualizer/visualizer-workspace-types";

interface WorkspaceDetailContentProps {
  activePanel: WorkspacePanelId;
  repository: RepositoryInfo;
  workspaceData?: DemoVisualizerData | null;
  onRegenerate: () => void;
}

export function WorkspaceDetailContent({
  activePanel,
  repository,
  workspaceData,
  onRegenerate,
}: WorkspaceDetailContentProps) {
  const policyQueryDefaults =
    workspaceData?.workspaceDetails.policyQuery ??
    demoVisualizerData.workspaceDetails.policyQuery;
  const compareDefaults =
    workspaceData?.workspaceDetails.compare ??
    demoVisualizerData.workspaceDetails.compare;
  const [selectedBranch, setSelectedBranch] = useState(
    policyQueryDefaults.selectedBranch ?? policyQueryDefaults.branchOptions[0],
  );
  const [selectedChangedPath, setSelectedChangedPath] = useState(
    policyQueryDefaults.selectedChangedPath ??
      policyQueryDefaults.changedPathOptions[0],
  );
  const [showPolicyQueryResults, setShowPolicyQueryResults] = useState(false);
  const [policyQueryResultState, setPolicyQueryResultState] = useState({
    matchedBranch: policyQueryDefaults.queryResult.matchedBranch,
    matchedRule: policyQueryDefaults.queryResult.matchedRule,
    requiredApprovals: policyQueryDefaults.queryResult.requiredApprovals,
    authorizedUsers: policyQueryDefaults.authorizedUsers,
  });
  const [selectedBaseVersion, setSelectedBaseVersion] = useState(
    compareDefaults.selectedBaseVersion ?? compareDefaults.baseVersionOptions[0],
  );
  const [selectedCompareVersion, setSelectedCompareVersion] = useState(
    compareDefaults.selectedCompareVersion ?? compareDefaults.compareVersionOptions[0],
  );
  const [hasCompared, setHasCompared] = useState(false);

  switch (activePanel) {
    case "graph-source":
      return (
        <DetailPanelGraphSource
          repository={repository}
          workspaceData={workspaceData}
          onRegenerate={onRegenerate}
        />
      );
    case "policy-query":
      return (
        <DetailPanelPolicyQuery
          workspaceData={workspaceData}
          selectedBranch={selectedBranch}
          selectedChangedPath={selectedChangedPath}
          showResults={showPolicyQueryResults}
          resultState={policyQueryResultState}
          onBranchChange={(value) => {
            setSelectedBranch(value);
            setShowPolicyQueryResults(false);
          }}
          onChangedPathChange={(value) => {
            setSelectedChangedPath(value);
            setShowPolicyQueryResults(false);
          }}
          onQuery={(result) => {
            setPolicyQueryResultState(result);
            setShowPolicyQueryResults(true);
          }}
        />
      );
    case "history":
      return <DetailPanelHistory workspaceData={workspaceData} />;
    case "compare":
      return (
        <DetailPanelCompare
          workspaceData={workspaceData}
          selectedBaseVersion={selectedBaseVersion}
          selectedCompareVersion={selectedCompareVersion}
          hasCompared={hasCompared}
          onBaseVersionChange={(value) => {
            setSelectedBaseVersion(value);
            setHasCompared(false);
          }}
          onCompareVersionChange={(value) => {
            setSelectedCompareVersion(value);
            setHasCompared(false);
          }}
          onSwapVersions={() => {
            setSelectedBaseVersion(selectedCompareVersion);
            setSelectedCompareVersion(selectedBaseVersion);
            setHasCompared(false);
          }}
          onCompare={() => setHasCompared(true)}
        />
      );
    case "metadata":
      return <DetailPanelMetadata workspaceData={workspaceData} />;
    case "settings":
      return <DetailPanelSettings workspaceData={workspaceData} />;
    default:
      return null;
  }
}
