"use client";

import { useState } from "react";
import { demoVisualizerData } from "@/lib/demo-visualizer-fixture";
import type { DemoVisualizerData } from "@/lib/demo-visualizer.types";
import {
  CheckboxRow,
  DetailActionButton,
  PanelSection,
  SectionBulletLabel,
  SectionDivider,
  SegmentedControl,
  ToggleRow,
} from "@/components/visualizer/detail/workspace-detail-primitives";

interface DetailPanelSettingsProps {
  workspaceData?: DemoVisualizerData | null;
  searchQuery?: string;
}

export function DetailPanelSettings({
  workspaceData,
  searchQuery,
}: DetailPanelSettingsProps) {
  const settingsData =
    workspaceData?.workspaceDetails.settings ??
    demoVisualizerData.workspaceDetails.settings;
  const defaultDetailLevels = settingsData.detailLevels;
  const defaultLayoutDirections = settingsData.layoutDirections;
  const defaultVisibleNodeTypes = settingsData.visibleNodeTypes;
  const defaultLabels = settingsData.labels;
  const defaultDataOptions = settingsData.dataOptions;
  const [selectedDetailLevel, setSelectedDetailLevel] = useState(
    settingsData.selectedDetailLevel ?? defaultDetailLevels[0],
  );
  const [selectedLayoutDirection, setSelectedLayoutDirection] = useState(
    settingsData.selectedLayoutDirection ?? defaultLayoutDirections[0],
  );
  const [isResetting, setIsResetting] = useState(false);
  const [visibleNodeTypes, setVisibleNodeTypes] = useState(defaultVisibleNodeTypes);
  const [labels, setLabels] = useState(defaultLabels);
  const [dataOptions, setDataOptions] = useState(defaultDataOptions);

  const toggleCheckedItem = (label: string) => {
    setVisibleNodeTypes((items) =>
      items.map((item) =>
        item.label === label ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const toggleEnabledItem = (
    label: string,
    setter: React.Dispatch<
      React.SetStateAction<Array<{ label: string; enabled: boolean }>>
    >,
  ) => {
    setter((items) =>
      items.map((item) =>
        item.label === label ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  };

  return (
    <div className="space-y-2 px-5 pb-8">
      <PanelSection label="Graph details" searchQuery={searchQuery}>
        <div className="space-y-2 pl-4">
          <SegmentedControl
            options={defaultDetailLevels}
            selected={selectedDetailLevel}
            onChange={setSelectedDetailLevel}
          />
          <SegmentedControl
            options={defaultLayoutDirections}
            selected={selectedLayoutDirection}
            onChange={setSelectedLayoutDirection}
          />
        </div>
      </PanelSection>
      <section className="space-y-4 py-4">
        <SectionBulletLabel label="Visible node types" searchQuery={searchQuery} />
        <div className="space-y-2">
          {visibleNodeTypes.map(({ label, checked }) => (
            <CheckboxRow
              key={label}
              label={label}
              checked={checked}
              searchQuery={searchQuery}
              onToggle={() => toggleCheckedItem(label)}
            />
          ))}
        </div>
        <SectionDivider />
      </section>
      <section className="space-y-4 py-4">
        <SectionBulletLabel label="Labels" searchQuery={searchQuery} />
        <div className="space-y-3">
          {labels.map(({ label, enabled }) => (
            <ToggleRow
              key={label}
              label={label}
              enabled={enabled}
              searchQuery={searchQuery}
              onToggle={() => toggleEnabledItem(label, setLabels)}
            />
          ))}
        </div>
        <SectionDivider />
      </section>
      <section className="space-y-4 py-4">
        <SectionBulletLabel label="Data" searchQuery={searchQuery} />
        <div className="space-y-3">
          {dataOptions.map(({ label, enabled }) => (
            <ToggleRow
              key={label}
              label={label}
              enabled={enabled}
              searchQuery={searchQuery}
              onToggle={() => toggleEnabledItem(label, setDataOptions)}
            />
          ))}
        </div>
      </section>
      <div className="pl-4 pt-4">
        <DetailActionButton
          label="Reset to default"
          loading={isResetting}
          onClick={() => {
            setIsResetting(true);
            window.requestAnimationFrame(() => {
              setSelectedDetailLevel(settingsData.selectedDetailLevel ?? defaultDetailLevels[0]);
              setSelectedLayoutDirection(
                settingsData.selectedLayoutDirection ?? defaultLayoutDirections[0],
              );
              setVisibleNodeTypes(defaultVisibleNodeTypes);
              setLabels(defaultLabels);
              setDataOptions(defaultDataOptions);
              window.setTimeout(() => setIsResetting(false), 250);
            });
          }}
        />
      </div>
    </div>
  );
}
