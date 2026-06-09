"use client";

import type React from "react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import arrowDropDownIcon from "@/assets/arrow_drop_down.png";
import branchIcon from "@/assets/branch.png";
import commitIcon from "@/assets/commit.png";
import completedIcon from "@/assets/completed.png";
import emptyIcon from "@/assets/empty.png";
import fileIcon from "@/assets/file.png";
import greenCheckboxIcon from "@/assets/green_check_box.png";
import metadataIcon from "@/assets/metadata.png";
import swapVertIcon from "@/assets/swap_vert.png";
import usersIcon from "@/assets/Users.png";
import type { RepositoryInfo } from "@/lib/repository-handler";
import type { DemoVisualizerData } from "@/lib/demo-visualizer-data";
import type { WorkspacePanelId } from "@/page-components/visualizer/visualizer-workspace-types";

interface WorkspaceDetailContentProps {
  activePanel: WorkspacePanelId;
  repository: RepositoryInfo;
  workspaceData?: DemoVisualizerData | null;
  onRegenerate: () => void;
}

interface SelectOption {
  label: string;
  value?: string;
  icon?: StaticImageData;
}

interface MetricCardData {
  value: string;
  label: string;
}

const bulletColor = "#BAD1EA";
const chipColor = "#A2C5E8";
const summaryCardColor = "#D6DEE4";

function SectionDivider() {
  return <div className="border-b border-[#9CA3AF]" />;
}

function SectionBulletLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: bulletColor }}
      />
      <span className="text-[13px] font-medium text-black">{label}</span>
    </div>
  );
}

function ValueChip({ label }: { label: string }) {
  return (
    <div
      className="inline-flex items-center border border-[#6B7280] px-2 py-1 text-[11px] font-medium text-black"
      style={{ backgroundColor: chipColor }}
    >
      {label}
    </div>
  );
}

function PanelSection({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-3 py-4 ${className}`}>
      <SectionBulletLabel label={label} />
      {children}
      <SectionDivider />
    </section>
  );
}

function StaticValueRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <section className="space-y-3 py-4">
      <div className="flex items-center justify-between gap-4">
        <SectionBulletLabel label={label} />
        <span className="text-right text-[13px] leading-[1.2] text-[#7E7E7E]">
          {value}
        </span>
      </div>
      <SectionDivider />
    </section>
  );
}

function SelectField({
  options,
  selectedLabel,
  chips = [],
  fullWidth = false,
  className = "",
}: {
  options: SelectOption[];
  selectedLabel?: string;
  chips?: string[];
  fullWidth?: boolean;
  className?: string;
}) {
  const selectedOption = options[0];

  return (
    <div
      className={`space-y-3 ${fullWidth ? "max-w-none" : "ml-auto max-w-[220px]"} ${className}`}
    >
      <button
        type="button"
        className={`flex h-9 w-full items-center justify-between rounded-[4px] border border-[#8B949E] bg-white px-3 text-left text-[12px] text-[#7E7E7E] ${fullWidth ? "" : ""}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon ? (
            <Image src={selectedOption.icon} alt="" className="h-4 w-4" />
          ) : null}
          <span className="truncate">{selectedLabel ?? selectedOption?.label}</span>
        </span>
        <Image src={arrowDropDownIcon} alt="" className="h-4 w-4" />
      </button>
      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {chips.map((chip) => (
            <ValueChip key={chip} label={chip} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function InlineSelectRow({
  label,
  options,
  chips = [],
  selectedLabel,
}: {
  label: string;
  options: SelectOption[];
  chips?: string[];
  selectedLabel?: string;
}) {
  return (
    <section className="space-y-3 py-4">
      <div className="flex items-center justify-between gap-4">
        <SectionBulletLabel label={label} />
        <SelectField
          options={options}
          selectedLabel={selectedLabel}
          className="w-[220px]"
        />
      </div>
      {chips.length > 0 ? (
        <div className="flex justify-end">
          <div className="flex w-[220px] flex-wrap gap-3">
            {chips.map((chip, index) => (
              <ValueChip key={`${chip}-${index}`} label={chip} />
            ))}
          </div>
        </div>
      ) : null}
      <SectionDivider />
    </section>
  );
}

function SummaryMetricGrid({ items }: { items: MetricCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="min-h-[78px] space-y-2 px-4 py-3"
          style={{ backgroundColor: summaryCardColor }}
        >
          <div className="text-[16px] font-semibold text-black">{item.value}</div>
          <div className="text-[12px] text-[#7E7E7E]">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function QueryUserCard({ name }: { name: string }) {
  return (
    <div className="flex w-[72px] flex-col items-center gap-1">
      <div className="flex h-[64px] w-[64px] items-center justify-center">
        <Image src={usersIcon} alt="" className="h-10 w-10" />
      </div>
      <span className="text-[12px] text-black">{name}</span>
    </div>
  );
}

function CommitHistoryItem({
  commitId,
  message,
  author,
  isSelected = false,
  isTouched = false,
  onSelect,
  onTouch,
}: {
  commitId: number;
  message: string;
  author: string;
  isSelected?: boolean;
  isTouched?: boolean;
  onSelect: (commitId: number) => void;
  onTouch: (commitId: number | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(commitId)}
      onMouseEnter={() => onTouch(commitId)}
      onMouseLeave={() => onTouch(null)}
      onPointerDown={() => onTouch(commitId)}
      onPointerUp={() => onTouch(null)}
      onFocus={() => onTouch(commitId)}
      onBlur={() => onTouch(null)}
      className={`flex w-full items-start gap-2 border-b border-[#BDBDBD] px-1 py-3 text-left ${
        isSelected ? "bg-[#F3F4F4]" : "bg-white"
      } ${isTouched ? "border border-[#61A1D1]" : ""}`}
    >
      <Image src={commitIcon} alt="" className="mt-1 h-4 w-4 flex-none" />
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="w-full truncate whitespace-nowrap text-[12px] text-black">
          {message}
        </div>
        <div className="text-[10px] text-[#8B949E]">opened by {author}</div>
      </div>
    </button>
  );
}

function SegmentedControl({
  options,
  selected,
}: {
  options: string[];
  selected: string;
}) {
  return (
    <div className="flex overflow-hidden rounded-[2px] border border-[#8B949E]">
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <button
            key={option}
            type="button"
            className={`min-w-[120px] px-4 py-2 text-[12px] font-medium ${
              isSelected ? "bg-[#8B8B8B] text-white" : "bg-white text-black"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 pl-4">
      <span className="text-[12px] text-black">{label}</span>
      <div
        className={`relative h-5 w-8 rounded-full border border-[#6B7280] ${
          enabled ? "bg-white" : "bg-white opacity-60"
        }`}
      >
        <div
          className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-[#6B7280] bg-white ${
            enabled ? "right-1" : "left-1"
          }`}
        />
      </div>
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) {
  return (
    <div className="flex items-center gap-3 pl-4">
      <Image
        src={checked ? greenCheckboxIcon : emptyIcon}
        alt=""
        className="h-4 w-4"
      />
      <span className={`text-[12px] ${checked ? "text-black" : "text-[#7E7E7E]"}`}>
        {label}
      </span>
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: StaticImageData;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-2 pl-7 text-[12px]">
      <Image src={icon} alt="" className="h-4 w-4" />
      <span className="text-[#7E7E7E]">
        {label}
        {value ? `: ${value}` : ""}
      </span>
    </div>
  );
}

function DetailPanelGraphSource({
  repository,
  workspaceData,
  onRegenerate,
}: {
  repository: RepositoryInfo;
  workspaceData?: DemoVisualizerData | null;
  onRegenerate: () => void;
}) {
  const graphSource = workspaceData?.workspaceDetails.graphSource;

  return (
    <div className="space-y-2 px-5 pb-8">
      <StaticValueRow
        label="Repository:"
        value={graphSource?.repository ?? repository.name}
      />
      <StaticValueRow
        label="Policy ref:"
        value={graphSource?.policyRef ?? "refs/gittuf/policy"}
      />

      <InlineSelectRow
        label="Policy version:"
        options={(graphSource?.policyVersionOptions ?? [
          "Latest - a1b2c3d",
          "May 01 - 91fe2a1",
        ]).map((label) => ({ label }))}
        selectedLabel={graphSource?.policyVersion}
        chips={graphSource?.selectedPolicyVersionChips ?? [repository.name]}
      />

      <InlineSelectRow
        label="Metadata:"
        options={(graphSource?.metadataOptions ?? ["targets.json", "root.json"]).map(
          (label) => ({ label }),
        )}
        selectedLabel={graphSource?.metadataFile}
        chips={graphSource?.selectedMetadataChips ?? [repository.name, repository.name]}
      />

      <InlineSelectRow
        label="Active mode"
        options={(graphSource?.activeModeOptions ?? [
          "Approval Check",
          "Threshold Review",
          "Signature Audit",
        ]).map((label) => ({ label }))}
        selectedLabel={graphSource?.activeMode}
        chips={graphSource?.selectedActiveModeChips ?? [repository.name]}
      />

      <div className="pl-2 pt-8">
        <button
          type="button"
          onClick={onRegenerate}
          className="rounded-[10px] px-5 py-4 text-[14px] font-medium text-black"
          style={{ backgroundColor: bulletColor }}
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}

function DetailPanelPolicyQuery({
  workspaceData,
}: {
  workspaceData?: DemoVisualizerData | null;
}) {
  const [showResults, setShowResults] = useState(false);
  const policyQuery = workspaceData?.workspaceDetails.policyQuery;

  return (
    <div className="space-y-2 px-5 pb-8">
      <PanelSection label="Branch">
        <SelectField
          options={(policyQuery?.branchOptions ?? ["main", "release", "hotfix"]).map(
            (label) => ({ label, icon: branchIcon }),
          )}
          selectedLabel={policyQuery?.selectedBranch}
          fullWidth
        />
      </PanelSection>

      <PanelSection label="Changed path">
        <SelectField
          options={(policyQuery?.changedPathOptions ?? [
            "src/auth/login.go",
            "src/**",
            "docs/**",
          ]).map((label) => ({ label, icon: fileIcon }))}
          selectedLabel={policyQuery?.selectedChangedPath}
          fullWidth
        />
      </PanelSection>

      <div className="pl-2 pt-2">
        <button
          type="button"
          onClick={() => setShowResults(true)}
          className="rounded-[10px] px-5 py-3 text-[14px] font-medium text-black"
          style={{ backgroundColor: bulletColor }}
        >
          Query policy
        </button>
      </div>

      {showResults ? (
        <>
          <PanelSection label="Query Result" className="pt-6">
            <div className="pl-7">
              <SummaryMetricGrid
                items={[
                  {
                    value: policyQuery?.queryResult.matchedBranch ?? "main",
                    label: "Matched branch",
                  },
                  {
                    value: policyQuery?.queryResult.matchedRule ?? "src/**",
                    label: "Matched rule",
                  },
                  {
                    value: String(policyQuery?.queryResult.requiredApprovals ?? 2),
                    label: "required approvals",
                  },
                ]}
              />
            </div>
          </PanelSection>

          <section className="space-y-4 py-4">
            <SectionBulletLabel label="Authorized users" />
            <div className="flex flex-wrap gap-5 pl-7">
              {(policyQuery?.authorizedUsers ?? ["Alice", "Carol", "Bob"]).map((user) => (
                <QueryUserCard key={user} name={user} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function DetailPanelHistory({
  workspaceData,
}: {
  workspaceData?: DemoVisualizerData | null;
}) {
  const historyData = workspaceData?.workspaceDetails.history;
  const commits =
    historyData?.commits.map((commit, index) => ({ id: index, ...commit })) ??
    Array.from({ length: 6 }, (_, index) => ({
      id: index,
      hash: `mock-${index}`,
      message:
        "[Linux fedora] Installation / dependency error with Webui already installed.",
      author: "tonylee12345",
      authorLabel: "opened by tonylee12345",
      date: "2026-06-01T00:00:00.000Z",
    }));
  const commitListRef = useRef<HTMLDivElement | null>(null);
  const commitRowHeight = 56;
  const [commitsPerPage, setCommitsPerPage] = useState(10);
  const totalPages = Math.ceil(commits.length / commitsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const defaultSelectedCommitId = Math.max(
    0,
    commits.findIndex((commit) => commit.hash === historyData?.selectedCommitHash),
  );
  const [selectedCommitId, setSelectedCommitId] = useState<number>(defaultSelectedCommitId);
  const [touchedCommitId, setTouchedCommitId] = useState<number | null>(null);
  const effectiveCurrentPage = Math.min(currentPage, totalPages);
  const visibleCommits = commits.slice(
    (effectiveCurrentPage - 1) * commitsPerPage,
    effectiveCurrentPage * commitsPerPage,
  );

  useEffect(() => {
    const commitList = commitListRef.current;
    if (!commitList) return;

    const updateCommitsPerPage = () => {
      const availableHeight = commitList.clientHeight;
      const nextCommitsPerPage = Math.max(
        1,
        Math.floor(availableHeight / commitRowHeight),
      );

      setCommitsPerPage(nextCommitsPerPage);
    };

    updateCommitsPerPage();

    const resizeObserver = new ResizeObserver(() => {
      updateCommitsPerPage();
    });

    resizeObserver.observe(commitList);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="flex h-full flex-col px-1 pb-4">
      <div className="flex items-center justify-end px-4 pb-3 pt-2">
        <button
          type="button"
          className="flex h-8 items-center gap-2 rounded-[4px] border border-[#8B949E] px-3 text-[12px] text-black"
        >
          <span>Sort by: {historyData?.selectedSort ?? "date"}</span>
          <Image src={arrowDropDownIcon} alt="" className="h-4 w-4" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div ref={commitListRef} className="min-h-0 flex-1 space-y-0 overflow-hidden">
          {visibleCommits.map((commit) => (
            <CommitHistoryItem
              key={commit.id}
              commitId={commit.id}
              message={commit.message}
              author={commit.authorLabel ?? `opened by ${commit.author}`}
              isSelected={selectedCommitId === commit.id}
              isTouched={touchedCommitId === commit.id}
              onSelect={setSelectedCommitId}
              onTouch={setTouchedCommitId}
            />
          ))}
        </div>
        {totalPages > 1 ? (
          <div className="mt-auto flex items-center justify-center gap-10 px-4 pt-6">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-[4px] border border-[#8B949E] px-3 py-1 text-[12px] text-black"
            >
              &lt; Previous
            </button>
            <div className="flex items-center gap-3 text-[12px]">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                const isActive = effectiveCurrentPage === pageNumber;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`rounded-[4px] px-2 py-1 ${
                      isActive ? "text-black" : "text-[#7E7E7E]"
                    }`}
                    style={isActive ? { backgroundColor: bulletColor } : undefined}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="rounded-[4px] border border-[#8B949E] px-3 py-1 text-[12px] text-black"
            >
              Next &gt;
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DetailPanelCompare({
  workspaceData,
}: {
  workspaceData?: DemoVisualizerData | null;
}) {
  const [showCompare, setShowCompare] = useState(true);
  const compareData = workspaceData?.workspaceDetails.compare;

  return (
    <div className="space-y-2 px-5 pb-8">
      <PanelSection label="Base Version">
        <SelectField
          options={(compareData?.baseVersionOptions ?? [
            "a1b1cd • May 1 • Add policy",
            "91fe2a • Apr 28 • Update policy",
          ]).map((label) => ({ label, icon: fileIcon }))}
          selectedLabel={compareData?.selectedBaseVersion}
          fullWidth
        />
      </PanelSection>

      <div className="flex justify-center py-1">
        <Image src={swapVertIcon} alt="" className="h-4 w-4" />
      </div>

      <PanelSection label="Compare Version">
        <SelectField
          options={(compareData?.compareVersionOptions ?? [
            "a2b3cd • May 5 • Update policy",
            "b4c5de • May 8 • Tighten thresholds",
          ]).map((label) => ({ label, icon: fileIcon }))}
          selectedLabel={compareData?.selectedCompareVersion}
          fullWidth
        />
      </PanelSection>

      <div className="pl-2 pt-2">
        <button
          type="button"
          onClick={() => setShowCompare(true)}
          className="rounded-[10px] px-5 py-3 text-[14px] font-medium text-black"
          style={{ backgroundColor: bulletColor }}
        >
          Compare
        </button>
      </div>

      {showCompare ? (
        <section className="space-y-4 py-4">
          <SectionBulletLabel label="Changed metadata" />
          <div className="space-y-2 pl-4 text-[12px]">
            {(compareData?.changedMetadata ?? [
              "Trust setup",
              "File rules",
              "Root metadata",
            ]).map((item, index) => (
              <div
                key={item}
                className={index < 2 ? "text-[#4CAF50]" : "text-[#7E7E7E]"}
              >
                {index < 2 ? "✓" : "—"} {item}
              </div>
            ))}
          </div>
          <SummaryMetricGrid
            items={
              compareData?.stats ?? [
                { value: "2", label: "roles changed" },
                { value: "1", label: "rule added" },
                { value: "1 ↑", label: "threshold" },
                { value: "1", label: "principal removed" },
              ]
            }
          />
        </section>
      ) : null}
    </div>
  );
}

function DetailPanelMetadata({
  workspaceData,
}: {
  workspaceData?: DemoVisualizerData | null;
}) {
  const metadataData = workspaceData?.workspaceDetails.metadata;

  return (
    <div className="space-y-2 px-5 pb-8">
      <PanelSection label="Policy file">
        <div className="space-y-2 pl-7 text-[12px] text-[#7E7E7E]">
          <p>Define trusted keys, roles, and root-level authority</p>
          <div className="flex flex-wrap gap-1">
            {(metadataData?.policyFiles ?? [
              "Trust setup: root.json",
              "File rules: target.json",
            ]).map((item, index) => (
              <ValueChip key={`${item}-${index}`} label={item} />
            ))}
          </div>
          <div className="h-1.5 w-full max-w-[305px] bg-[#1E88E5]" />
        </div>
      </PanelSection>

      <PanelSection label="Status">
        <div className="space-y-2">
          {metadataData?.status.payloadDecoded ?? true ? (
            <StatusRow icon={completedIcon} label="Payload decoded" />
          ) : null}
          <StatusRow
            icon={completedIcon}
            label={metadataData?.status.signaturesFound ?? "1 signature found"}
          />
          <StatusRow
            icon={metadataIcon}
            label="Source commit"
            value={metadataData?.status.sourceCommit ?? "a1b2c3d"}
          />
        </div>
      </PanelSection>

      <section className="space-y-4 py-4">
        <SectionBulletLabel label="View" />
        <div className="space-y-3 pl-2">
          <div className="flex w-fit overflow-hidden rounded-[3px] border border-[#8B949E]">
            {(metadataData?.views ?? ["Summary", "Decoded JSON", "Envelope"]).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`border-r border-[#8B949E] px-3 py-1 text-[11px] last:border-r-0 ${
                  (metadataData?.selectedView ?? "Summary") === tab
                    ? "bg-[#7E7E7E] text-white"
                    : "bg-white text-[#7E7E7E]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <SummaryMetricGrid
            items={
              metadataData?.summary ?? [
                { value: "3", label: "roles" },
                { value: "5", label: "principals" },
                { value: "4", label: "File rules" },
                { value: "1", label: "signatures" },
                { value: "June 12, 2026", label: "expires" },
              ]
            }
          />
        </div>
      </section>
    </div>
  );
}

function DetailPanelSettings({
  workspaceData,
}: {
  workspaceData?: DemoVisualizerData | null;
}) {
  const settingsData = workspaceData?.workspaceDetails.settings;

  return (
    <div className="space-y-2 px-5 pb-8">
      <PanelSection label="Graph details">
        <div className="space-y-2 pl-4">
          <SegmentedControl
            options={settingsData?.detailLevels ?? ["Simple", "Detailed"]}
            selected={settingsData?.selectedDetailLevel ?? "Simple"}
          />
          <SegmentedControl
            options={settingsData?.layoutDirections ?? ["Top → Bottom", "Left →right"]}
            selected={settingsData?.selectedLayoutDirection ?? "Top → Bottom"}
          />
        </div>
      </PanelSection>

      <section className="space-y-4 py-4">
        <div className="pl-4 text-[13px] font-medium text-black">Visible node types</div>
        <div className="space-y-2">
          {(settingsData?.visibleNodeTypes ?? [
            { label: "File rules", checked: true },
            { label: "Roles", checked: true },
            { label: "Principals", checked: true },
            { label: "Thresholds", checked: true },
            { label: "Signatures", checked: false },
            { label: "Expiration", checked: false },
          ]).map(({ label, checked }) => (
            <CheckboxRow
              key={label}
              label={label}
              checked={checked}
            />
          ))}
        </div>
        <SectionDivider />
      </section>

      <section className="space-y-4 py-4">
        <SectionBulletLabel label="Labels" />
        <div className="space-y-3">
          {(settingsData?.labels ?? [
            { label: "show edge labels", enabled: true },
            { label: "show approval counts", enabled: true },
            { label: "show legend", enabled: false },
          ]).map(({ label, enabled }) => (
            <ToggleRow key={label} label={label} enabled={enabled} />
          ))}
        </div>
        <SectionDivider />
      </section>

      <section className="space-y-4 py-4">
        <SectionBulletLabel label="Data" />
        <div className="space-y-3">
          {(settingsData?.dataOptions ?? [
            { label: "Use latest policy by default", enabled: true },
            { label: "Show raw metadata warnings", enabled: false },
          ]).map(({ label, enabled }) => (
            <ToggleRow key={label} label={label} enabled={enabled} />
          ))}
        </div>
      </section>

      <div className="pl-4 pt-4">
        <button
          type="button"
          className="rounded-[8px] px-4 py-3 text-[13px] font-medium text-black"
          style={{ backgroundColor: bulletColor }}
        >
          Reset to default
        </button>
      </div>
    </div>
  );
}

export function WorkspaceDetailContent({
  activePanel,
  repository,
  workspaceData,
  onRegenerate,
}: WorkspaceDetailContentProps) {
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
      return <DetailPanelPolicyQuery workspaceData={workspaceData} />;
    case "history":
      return <DetailPanelHistory workspaceData={workspaceData} />;
    case "compare":
      return <DetailPanelCompare workspaceData={workspaceData} />;
    case "metadata":
      return <DetailPanelMetadata workspaceData={workspaceData} />;
    case "settings":
      return <DetailPanelSettings workspaceData={workspaceData} />;
    default:
      return null;
  }
}
