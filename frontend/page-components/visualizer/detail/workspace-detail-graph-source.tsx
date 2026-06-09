"use client";

import { useState } from "react";
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
        chips={[selectedPolicyVersion]}
        onChange={setSelectedPolicyVersion}
      />
      <InlineSelectRow
        label="Metadata:"
        options={metadataOptions.map((label) => ({ label }))}
        selectedLabel={selectedMetadataFile}
        chips={[selectedMetadataFile]}
        onChange={setSelectedMetadataFile}
      />
      <InlineSelectRow
        label="Active mode"
        options={activeModeOptions.map((label) => ({ label }))}
        selectedLabel={selectedActiveMode}
        chips={[selectedActiveMode]}
        onChange={setSelectedActiveMode}
      />
      <div className="pl-2 pt-8">
        <button
          type="button"
          onClick={onRegenerate}
          className="rounded-[8px] border border-[#8B949E] px-4 py-2.5 text-[13px] font-medium text-black"
          style={{ backgroundColor: detailColors.bullet }}
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}
