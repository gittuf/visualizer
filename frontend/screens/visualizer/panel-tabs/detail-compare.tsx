"use client";

import Image from "next/image";
import { useState } from "react";
import emptyFileIcon from "@/assets/empty_file.png";
import swapVertIcon from "@/assets/swap_vert.png";
import { demoVisualizerData } from "@/lib/demo-visualizer-fixture";
import type { DemoVisualizerData } from "@/lib/demo-visualizer.types";
import {
  DetailActionButton,
  PanelSection,
  SearchHighlightText,
  SectionBulletLabel,
  SelectField,
  SummaryMetricGrid,
} from "@/components/visualizer/detail/workspace-detail-primitives";
import type { VisualizerComparisonResult } from "@/screens/visualizer/compare.utils";

interface DetailPanelCompareProps {
  workspaceData?: DemoVisualizerData | null;
  searchQuery?: string;
  selectedBaseVersion: string;
  selectedCompareVersion: string;
  comparisonResult: VisualizerComparisonResult;
  hasCompared: boolean;
  onBaseVersionChange: (value: string) => void;
  onCompareVersionChange: (value: string) => void;
  onSwapVersions: () => void;
  onCompare: () => void;
}

export function DetailPanelCompare({
  workspaceData,
  searchQuery,
  selectedBaseVersion,
  selectedCompareVersion,
  comparisonResult,
  hasCompared,
  onBaseVersionChange,
  onCompareVersionChange,
  onSwapVersions,
  onCompare,
}: DetailPanelCompareProps) {
  const [isComparing, setIsComparing] = useState(false);
  const compareData =
    workspaceData?.workspaceDetails.compare ??
    demoVisualizerData.workspaceDetails.compare;
  const baseOptions = compareData.baseVersionOptions;
  const compareOptions = compareData.compareVersionOptions;

  return (
    <div className="space-y-2 px-5 pb-8">
      <PanelSection label="Base Version" className="pb-2" searchQuery={searchQuery}>
        <SelectField
          options={baseOptions.map((label) => ({ label, icon: emptyFileIcon }))}
          selectedLabel={selectedBaseVersion}
          onChange={onBaseVersionChange}
          fullWidth
        />
      </PanelSection>
      <div className="flex justify-center py-0.5">
        <button
          type="button"
          onClick={onSwapVersions}
          className="group flex h-8 w-8 items-center justify-center rounded-sm transition-colors duration-150"
        >
          <Image
            src={swapVertIcon}
            alt=""
            className="h-5 w-5 transition-all duration-150 group-hover:brightness-0 group-hover:saturate-100 group-hover:invert-[24%] group-hover:sepia-[96%] group-hover:saturate-[2678%] group-hover:hue-rotate-[204deg] group-hover:brightness-[97%] group-hover:contrast-[101%]"
          />
        </button>
      </div>
      <PanelSection label="Compare Version" className="pt-2" searchQuery={searchQuery}>
        <SelectField
          options={compareOptions.map((label) => ({ label, icon: emptyFileIcon }))}
          selectedLabel={selectedCompareVersion}
          onChange={onCompareVersionChange}
          fullWidth
        />
      </PanelSection>
      <div className="pl-2 pt-2">
        <DetailActionButton
          label="Compare"
          loading={isComparing}
          onClick={() => {
            setIsComparing(true);
            window.requestAnimationFrame(() => {
              onCompare();
              window.setTimeout(() => setIsComparing(false), 250);
            });
          }}
        />
      </div>
      {hasCompared ? (
        <section className="space-y-4 py-4">
          <SectionBulletLabel label="Changed metadata" searchQuery={searchQuery} />
          <div className="space-y-2 pl-4 text-[12px]">
            {comparisonResult.changedMetadata.length > 0 ? (
              comparisonResult.changedMetadata.map((item) => (
                <div key={item} className="text-(--approve-color)">
                  ✓ <SearchHighlightText text={item} query={searchQuery} />
                </div>
              ))
            ) : (
              <div className="text-(--dark-gray)">— No metadata changes</div>
            )}
          </div>
          <SummaryMetricGrid items={comparisonResult.stats} searchQuery={searchQuery} />
        </section>
      ) : null}
    </div>
  );
}
