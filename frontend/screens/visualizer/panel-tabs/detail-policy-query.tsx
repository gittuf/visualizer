"use client";

import { useMemo } from "react";
import branchIcon from "@/assets/branch.png";
import emptyFileIcon from "@/assets/empty_file.png";
import {
  demoVisualizerData,
  type DemoVisualizerData,
} from "@/lib/demo-visualizer-data";
import {
  detailColors,
  PanelSection,
  QueryUserCard,
  SectionBulletLabel,
  SelectField,
  SummaryMetricGrid,
} from "@/components/visualizer/detail/workspace-detail-primitives";

interface DetailPanelPolicyQueryProps {
  workspaceData?: DemoVisualizerData | null;
  searchQuery?: string;
  selectedBranch: string;
  selectedChangedPath: string;
  showResults: boolean;
  resultState: {
    matchedBranch: string;
    matchedRule: string;
    requiredApprovals: number;
    authorizedUsers: string[];
  };
  onBranchChange: (value: string) => void;
  onChangedPathChange: (value: string) => void;
  onQuery: (result: {
    matchedBranch: string;
    matchedRule: string;
    requiredApprovals: number;
    authorizedUsers: string[];
  }) => void;
}

export function DetailPanelPolicyQuery({
  workspaceData,
  searchQuery,
  selectedBranch,
  selectedChangedPath,
  showResults,
  resultState,
  onBranchChange,
  onChangedPathChange,
  onQuery,
}: DetailPanelPolicyQueryProps) {
  const policyQuery =
    workspaceData?.workspaceDetails.policyQuery ??
    demoVisualizerData.workspaceDetails.policyQuery;
  const branchOptions = policyQuery.branchOptions;
  const changedPathOptions = policyQuery.changedPathOptions;
  const queryScenario = useMemo(
    () =>
      policyQuery.queryScenarios?.find(
        (scenario) =>
          scenario.branch === selectedBranch &&
          scenario.changedPath === selectedChangedPath,
      ),
    [policyQuery.queryScenarios, selectedBranch, selectedChangedPath],
  );

  return (
    <div className="space-y-2 px-5 pb-8">
      <PanelSection label="Branch" searchQuery={searchQuery}>
        <SelectField
          options={branchOptions.map((label) => ({ label, icon: branchIcon }))}
          selectedLabel={selectedBranch}
          onChange={onBranchChange}
          fullWidth
        />
      </PanelSection>
      <PanelSection label="Changed path" searchQuery={searchQuery}>
        <SelectField
          options={changedPathOptions.map((label) => ({ label, icon: emptyFileIcon }))}
          selectedLabel={selectedChangedPath}
          onChange={onChangedPathChange}
          fullWidth
        />
      </PanelSection>
      <div className="pl-2 pt-2">
        <button
          type="button"
          onClick={() => {
            onQuery({
              matchedBranch:
                queryScenario?.matchedBranch ??
                policyQuery.queryResult.matchedBranch ??
                selectedBranch,
              matchedRule:
                queryScenario?.matchedRule ??
                policyQuery.queryResult.matchedRule ??
                selectedChangedPath,
              requiredApprovals:
                queryScenario?.requiredApprovals ??
                policyQuery.queryResult.requiredApprovals ??
                2,
              authorizedUsers:
                queryScenario?.authorizedUsers ??
                policyQuery.authorizedUsers,
            });
          }}
          className="rounded-[8px] border border-[#8B949E] px-4 py-2.5 text-[13px] font-medium text-black"
          style={{ backgroundColor: detailColors.bullet }}
        >
          Query policy
        </button>
      </div>
      {showResults ? (
        <>
          <PanelSection label="Query Result" className="pt-6" searchQuery={searchQuery}>
            <SummaryMetricGrid
              searchQuery={searchQuery}
              items={[
                {
                  value: resultState.matchedBranch,
                  label: "Matched branch",
                },
                {
                  value: resultState.matchedRule,
                  label: "Matched rule",
                },
                {
                  value: String(resultState.requiredApprovals),
                  label: "required approvals",
                },
              ]}
            />
          </PanelSection>
          <section className="space-y-4 py-4">
            <SectionBulletLabel label="Authorized users" searchQuery={searchQuery} />
            <div className="flex flex-wrap gap-5">
              {resultState.authorizedUsers.map((user) => (
                <QueryUserCard key={user} name={user} searchQuery={searchQuery} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
