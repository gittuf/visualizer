"use client";

import { demoVisualizerData } from "@/lib/demo-visualizer-fixture";
import type { DemoVisualizerData } from "@/lib/demo-visualizer.types";
import completedIcon from "@/assets/completed.png";
import metadataIcon from "@/assets/metadata.png";
import {
  PanelSection,
  SearchHighlightText,
  SectionBulletLabel,
  StatusRow,
  SummaryMetricGrid,
  ValueChip,
} from "@/components/visualizer/detail/workspace-detail-primitives";

interface DetailPanelMetadataProps {
  workspaceData?: DemoVisualizerData | null;
  searchQuery?: string;
}

export function DetailPanelMetadata({
  workspaceData,
  searchQuery,
}: DetailPanelMetadataProps) {
  const metadataData =
    workspaceData?.workspaceDetails.metadata ??
    demoVisualizerData.workspaceDetails.metadata;

  return (
    <div className="space-y-2 px-5 pb-8">
      <PanelSection label="Policy file" searchQuery={searchQuery}>
        <div className="space-y-2 text-[12px] text-(--dark-gray)">
          <SearchHighlightText
            text="Define trusted keys, roles, and root-level authority"
            query={searchQuery}
            className="text-[12px] text-(--dark-gray)"
          />
          <div className="flex flex-wrap gap-1">
            {metadataData.policyFiles.map((item, index) => (
              <ValueChip
                key={`${item}-${index}`}
                label={item}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </div>
      </PanelSection>
      <PanelSection label="Status" searchQuery={searchQuery}>
        <div className="space-y-2">
          {metadataData.status.payloadDecoded ? (
            <StatusRow
              icon={completedIcon}
              label="Payload decoded"
              searchQuery={searchQuery}
            />
          ) : null}
          <StatusRow
            icon={completedIcon}
            label={metadataData.status.signaturesFound}
            searchQuery={searchQuery}
          />
          <StatusRow
            icon={metadataIcon}
            label="Source commit"
            value={metadataData.status.sourceCommit}
            searchQuery={searchQuery}
          />
        </div>
      </PanelSection>
      <section className="space-y-4 py-4">
        <SectionBulletLabel label="View" searchQuery={searchQuery} />
        <div className="space-y-3 pl-2">
          <div className="flex w-fit overflow-hidden rounded-[3px] border border-(--secondary-color)">
            {metadataData.views.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`border-r border-(--secondary-color) px-3 py-1 text-[11px] last:border-r-0 ${
                  metadataData.selectedView === tab
                    ? "bg-(--dark-gray) text-white"
                    : "bg-white text-(--dark-gray)"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <SummaryMetricGrid items={metadataData.summary} searchQuery={searchQuery} />
        </div>
      </section>
    </div>
  );
}
