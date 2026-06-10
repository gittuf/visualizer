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
} from "@/screens/visualizer/panel-tabs/detail-panels";
import type { HistorySortField } from "@/screens/visualizer/history.types";
import type { WorkspacePanelId } from "@/screens/visualizer/visualizer.types";

interface WorkspaceDetailContentProps {
  activePanel: WorkspacePanelId;
  repository: RepositoryInfo;
  workspaceData?: DemoVisualizerData | null;
  onRegenerate: () => void;
  historyCommits: Array<{
    id: number;
    hash: string;
    message: string;
    author: string;
    authorLabel?: string;
    date: string;
  }>;
  selectedHistoryCommitHash?: string | null;
  onHistoryCommitSelect?: (commitHash: string) => void;
  searchQuery?: string;
  selectedHistorySort: HistorySortField;
  isHistorySortAscending: boolean;
  onHistorySortChange: (sortField: HistorySortField) => void;
  onHistorySortDirectionToggle: () => void;
  selectedBaseVersion: string;
  selectedCompareVersion: string;
  hasCompared: boolean;
  onBaseVersionChange: (value: string) => void;
  onCompareVersionChange: (value: string) => void;
  onSwapVersions: () => void;
  onCompare: () => void;
}

export function WorkspaceDetailContent({
  activePanel,
  repository,
  workspaceData,
  onRegenerate,
  historyCommits,
  selectedHistoryCommitHash,
  onHistoryCommitSelect,
  searchQuery,
  selectedHistorySort,
  isHistorySortAscending,
  onHistorySortChange,
  onHistorySortDirectionToggle,
  selectedBaseVersion,
  selectedCompareVersion,
  hasCompared,
  onBaseVersionChange,
  onCompareVersionChange,
  onSwapVersions,
  onCompare,
}: WorkspaceDetailContentProps) {
  const policyQueryDefaults =
    workspaceData?.workspaceDetails.policyQuery ??
    demoVisualizerData.workspaceDetails.policyQuery;
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

  switch (activePanel) {
    case "graph-source":
      return (
        <DetailPanelGraphSource
          repository={repository}
          workspaceData={workspaceData}
          onRegenerate={onRegenerate}
          searchQuery={searchQuery}
        />
      );
    case "policy-query":
      return (
        <DetailPanelPolicyQuery
          workspaceData={workspaceData}
          searchQuery={searchQuery}
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
      return (
        <DetailPanelHistory
          workspaceData={workspaceData}
          commits={historyCommits}
          selectedCommitHash={selectedHistoryCommitHash}
          onSelectedCommitChange={onHistoryCommitSelect}
          searchQuery={searchQuery}
          selectedSort={selectedHistorySort}
          isAscending={isHistorySortAscending}
          onSortChange={onHistorySortChange}
          onSortDirectionToggle={onHistorySortDirectionToggle}
        />
      );
    case "compare":
      return (
        <DetailPanelCompare
          workspaceData={workspaceData}
          searchQuery={searchQuery}
          selectedBaseVersion={selectedBaseVersion}
          selectedCompareVersion={selectedCompareVersion}
          hasCompared={hasCompared}
          onBaseVersionChange={onBaseVersionChange}
          onCompareVersionChange={onCompareVersionChange}
          onSwapVersions={onSwapVersions}
          onCompare={onCompare}
        />
      );
    case "metadata":
      return <DetailPanelMetadata workspaceData={workspaceData} searchQuery={searchQuery} />;
    case "settings":
      return <DetailPanelSettings workspaceData={workspaceData} searchQuery={searchQuery} />;
    default:
      return null;
  }
}
