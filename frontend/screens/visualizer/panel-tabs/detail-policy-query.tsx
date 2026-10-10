"use client";

import { useMemo, useState } from "react";
import branchIcon from "@/assets/branch.png";
import emptyFileIcon from "@/assets/empty_file.png";
import { demoVisualizerData } from "@/lib/demo-visualizer-fixture";
import type { DemoVisualizerData } from "@/lib/demo-visualizer.types";
import { queryPolicy } from "@/lib/api";
import type { RepositoryInfo } from "@/lib/repository-handler";
import type { PolicyQueryResult } from "@/lib/types";
import {
  DetailActionButton,
  PanelSection,
  QueryUserCard,
  SectionBulletLabel,
  SelectField,
  SummaryMetricGrid,
} from "@/components/visualizer/detail/workspace-detail-primitives";

interface DetailPanelPolicyQueryProps {
  repository: RepositoryInfo;
  commitHash?: string;
  workspaceData?: DemoVisualizerData | null;
  searchQuery?: string;
  selectedBranch: string;
  selectedChangedPath: string;
  showResults: boolean;
  resultState: PolicyQueryResult;
  onBranchChange: (value: string) => void;
  onChangedPathChange: (value: string) => void;
  onQuery: (result: PolicyQueryResult) => void;
}

export function DetailPanelPolicyQuery({
  repository,
  commitHash,
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
  const [isQuerying, setIsQuerying] = useState(false);
  const uniqueAuthorizedUsers = (users: string[]) =>
    users.filter((user, index, allUsers) => user && allUsers.indexOf(user) === index);
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
        <DetailActionButton
          label="Query policy"
          loading={isQuerying}
          onClick={async () => {
            if (!commitHash) {
              return;
            }

            setIsQuerying(true);
            try {
              const response = await queryPolicy(
                repository.path,
                commitHash,
                selectedBranch,
                selectedChangedPath,
              );

              onQuery({
                matchedBranch: response.matchedBranch,
                matchedRule: response.matchedRule,
                requiredApprovals: response.requiredApprovals,
                authorizedUsers: uniqueAuthorizedUsers(response.authorizedUsers),
              });
            } catch {
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
                  0,
                authorizedUsers: uniqueAuthorizedUsers(
                  queryScenario?.authorizedUsers ??
                  policyQuery.authorizedUsers,
                ),
              });
            } finally {
              setIsQuerying(false);
            }
          }}
        />
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
              {uniqueAuthorizedUsers(resultState.authorizedUsers).map((user) => (
                <QueryUserCard key={user} name={user} searchQuery={searchQuery} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
