"use client";

import {
  demoVisualizerData,
  type DemoVisualizerData,
} from "@/lib/demo-visualizer-data";
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
        <div className="space-y-2 text-[12px] text-[#7E7E7E]">
          <SearchHighlightText
            text="Define trusted keys, roles, and root-level authority"
            query={searchQuery}
            className="text-[12px] text-[#7E7E7E]"
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
          <div className="flex w-fit overflow-hidden rounded-[3px] border border-[#8B949E]">
            {metadataData.views.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`border-r border-[#8B949E] px-3 py-1 text-[11px] last:border-r-0 ${
                  metadataData.selectedView === tab
                    ? "bg-[#7E7E7E] text-white"
                    : "bg-white text-[#7E7E7E]"
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
