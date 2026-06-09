"use client";

import Image from "next/image";
import { useMemo } from "react";
import emptyFileIcon from "@/assets/empty_file.png";
import swapVertIcon from "@/assets/swap_vert.png";
import {
  demoVisualizerData,
  type DemoVisualizerData,
} from "@/lib/demo-visualizer-data";
import {
  detailColors,
  PanelSection,
  SectionBulletLabel,
  SelectField,
  SummaryMetricGrid,
} from "@/components/visualizer/detail/workspace-detail-primitives";

interface DetailPanelCompareProps {
  workspaceData?: DemoVisualizerData | null;
  selectedBaseVersion: string;
  selectedCompareVersion: string;
  hasCompared: boolean;
  onBaseVersionChange: (value: string) => void;
  onCompareVersionChange: (value: string) => void;
  onSwapVersions: () => void;
  onCompare: () => void;
}

export function DetailPanelCompare({
  workspaceData,
  selectedBaseVersion,
  selectedCompareVersion,
  hasCompared,
  onBaseVersionChange,
  onCompareVersionChange,
  onSwapVersions,
  onCompare,
}: DetailPanelCompareProps) {
  const compareData =
    workspaceData?.workspaceDetails.compare ??
    demoVisualizerData.workspaceDetails.compare;
  const baseOptions = compareData.baseVersionOptions;
  const compareOptions = compareData.compareVersionOptions;
  const comparisonResult = useMemo(() => {
    const key = `${selectedBaseVersion}|${selectedCompareVersion}`;
    return (
      compareData.comparisonsByPair?.[key] ?? {
        changedMetadata: compareData.changedMetadata,
        stats: compareData.stats,
      }
    );
  }, [compareData, selectedBaseVersion, selectedCompareVersion]);

  return (
    <div className="space-y-2 px-5 pb-8">
      <PanelSection label="Base Version" className="pb-2">
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
          className="flex h-8 w-8 items-center justify-center rounded-[4px] transition-colors duration-150 hover:bg-[#F3F4F4]"
        >
          <Image src={swapVertIcon} alt="" className="h-5 w-5" />
        </button>
      </div>
      <PanelSection label="Compare Version" className="pt-2">
        <SelectField
          options={compareOptions.map((label) => ({ label, icon: emptyFileIcon }))}
          selectedLabel={selectedCompareVersion}
          onChange={onCompareVersionChange}
          fullWidth
        />
      </PanelSection>
      <div className="pl-2 pt-2">
        <button
          type="button"
          onClick={onCompare}
          className="rounded-[10px] px-5 py-3 text-[14px] font-medium text-black"
          style={{ backgroundColor: detailColors.bullet }}
        >
          Compare
        </button>
      </div>
      {hasCompared ? (
        <section className="space-y-4 py-4">
          <SectionBulletLabel label="Changed metadata" />
          <div className="space-y-2 pl-4 text-[12px]">
            {comparisonResult.changedMetadata.map((item, index) => (
              <div
                key={item}
                className={index < 2 ? "text-[#4CAF50]" : "text-[#7E7E7E]"}
              >
                {index < 2 ? "✓" : "—"} {item}
              </div>
            ))}
          </div>
          <SummaryMetricGrid items={comparisonResult.stats} />
        </section>
      ) : null}
    </div>
  );
}
