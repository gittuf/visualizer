"use client";

import { useMemo, useState } from "react";
import {
  demoVisualizerData,
  type DemoVisualizerData,
} from "@/lib/demo-visualizer-data";
import type { RepositoryInfo } from "@/lib/repository-handler";
import {
  detailColors,
  InlineSelectRow,
  StaticValueRow,
} from "@/components/visualizer/detail/workspace-detail-primitives";

interface DetailPanelGraphSourceProps {
  repository: RepositoryInfo;
  workspaceData?: DemoVisualizerData | null;
  onRegenerate: () => void;
}

export function DetailPanelGraphSource({
  repository,
  workspaceData,
  onRegenerate,
}: DetailPanelGraphSourceProps) {
  const graphSource =
    workspaceData?.workspaceDetails.graphSource ??
    demoVisualizerData.workspaceDetails.graphSource;
  const policyVersionOptions = graphSource.policyVersionOptions;
  const metadataOptions = graphSource.metadataOptions;
  const activeModeOptions = graphSource.activeModeOptions;
  const [selectedPolicyVersion, setSelectedPolicyVersion] = useState(
    graphSource.policyVersion ?? policyVersionOptions[0],
  );
  const [selectedMetadataFile, setSelectedMetadataFile] = useState(
    graphSource.metadataFile ?? metadataOptions[0],
  );
  const [selectedActiveMode, setSelectedActiveMode] = useState(
    graphSource.activeMode ?? activeModeOptions[0],
  );
  const policyVersionChips = useMemo(
    () =>
      graphSource.policyVersionChipsByOption?.[selectedPolicyVersion] ??
      graphSource.selectedPolicyVersionChips,
    [graphSource, selectedPolicyVersion],
  );
  const metadataChips = useMemo(
    () =>
      graphSource.metadataChipsByOption?.[selectedMetadataFile] ??
      graphSource.selectedMetadataChips,
    [graphSource, selectedMetadataFile],
  );
  const activeModeChips = useMemo(
    () =>
      graphSource.activeModeChipsByOption?.[selectedActiveMode] ??
      graphSource.selectedActiveModeChips,
    [graphSource, selectedActiveMode],
  );

  return (
    <div className="space-y-2 px-5 pb-8">
      <StaticValueRow
        label="Repository:"
        value={graphSource.repository ?? repository.name}
      />
      <StaticValueRow
        label="Policy ref:"
        value={graphSource.policyRef}
      />
      <InlineSelectRow
        label="Policy version:"
        options={policyVersionOptions.map((label) => ({ label }))}
        selectedLabel={selectedPolicyVersion}
        chips={policyVersionChips}
        onChange={setSelectedPolicyVersion}
      />
      <InlineSelectRow
        label="Metadata:"
        options={metadataOptions.map((label) => ({ label }))}
        selectedLabel={selectedMetadataFile}
        chips={metadataChips}
        onChange={setSelectedMetadataFile}
      />
      <InlineSelectRow
        label="Active mode"
        options={activeModeOptions.map((label) => ({ label }))}
        selectedLabel={selectedActiveMode}
        chips={activeModeChips}
        onChange={setSelectedActiveMode}
      />
      <div className="pl-2 pt-8">
        <button
          type="button"
          onClick={onRegenerate}
          className="rounded-[10px] px-5 py-4 text-[14px] font-medium text-black"
          style={{ backgroundColor: detailColors.bullet }}
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}
