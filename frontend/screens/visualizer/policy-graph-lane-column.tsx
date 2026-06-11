"use client";

import Image from "next/image";
import branchIcon from "@/assets/branch.png";
import fileIcon from "@/assets/file.png";
import usersIcon from "@/assets/Users.png";
import userIcon from "@/assets/user.png";
import {
  branchBox,
  fileBox,
  principalBox,
  roleBox,
  rowY,
} from "@/screens/visualizer/policy-graph.constants";
import {
  getIconClassName,
  getIconFilter,
  getLaneNodeChangeTypes,
  getNodeTextStyle,
  getPrincipalChangeType,
  getPrincipalOffsets,
  getTextClassName,
} from "@/screens/visualizer/policy-graph.utils";
import type { PolicyGraphLane } from "@/screens/visualizer/policy-graph.types";

interface PolicyGraphLaneColumnProps {
  branchLabel: string;
  centerX: number;
  lane: PolicyGraphLane;
  normalizedSearchQuery: string;
  principalNames: string[];
}

export function PolicyGraphLaneColumn({
  branchLabel,
  centerX,
  lane,
  normalizedSearchQuery,
  principalNames,
}: PolicyGraphLaneColumnProps) {
  const changeTypes = getLaneNodeChangeTypes(lane);
  const lanePrincipals =
    lane.principals ??
    principalNames.map((name) => ({
      name,
    }));
  const principalOffsets = getPrincipalOffsets(lanePrincipals.length);

  return (
    <div>
      <div
        className="absolute flex flex-col items-center text-center"
        style={{
          left: `${centerX - branchBox.width / 2}px`,
          top: `${rowY.branch}px`,
          width: `${branchBox.width}px`,
          minHeight: `${branchBox.height}px`,
        }}
      >
        <Image
          src={branchIcon}
          alt=""
          className={`mt-1 h-9 w-9 ${getIconClassName(changeTypes.branch)}`}
          style={{ filter: getIconFilter(changeTypes.branch) }}
          draggable={false}
        />
        <div
          className={`mt-2 text-[16px] leading-[1.3] ${getTextClassName(changeTypes.branch)}`}
          style={getNodeTextStyle(branchLabel, normalizedSearchQuery)}
        >
          {branchLabel}
        </div>
      </div>

      <div
        className="absolute flex flex-col items-center text-center"
        style={{
          left: `${centerX - fileBox.width / 2}px`,
          top: `${rowY.file}px`,
          width: `${fileBox.width}px`,
          minHeight: `${fileBox.height}px`,
        }}
      >
        <Image
          src={fileIcon}
          alt=""
          className={`mt-1 h-12 w-10 ${getIconClassName(changeTypes.path)}`}
          style={{ filter: getIconFilter(changeTypes.path) }}
          draggable={false}
        />
        <div
          className={`mt-2 text-[16px] leading-[1.3] ${getTextClassName(changeTypes.path)}`}
          style={getNodeTextStyle(lane.pathLabel, normalizedSearchQuery)}
        >
          {lane.pathLabel}
        </div>
      </div>

      <div
        className="absolute flex flex-col items-center text-center"
        style={{
          left: `${centerX - roleBox.width / 2}px`,
          top: `${rowY.role}px`,
          width: `${roleBox.width}px`,
          minHeight: `${roleBox.height}px`,
        }}
      >
        <Image
          src={usersIcon}
          alt=""
          className={`mt-1 h-12 w-12 ${getIconClassName(changeTypes.roleIcon)}`}
          style={{ filter: getIconFilter(changeTypes.roleIcon) }}
          draggable={false}
        />
        <div
          className={`mt-2 text-[16px] leading-[1.3] ${getTextClassName(changeTypes.roleIcon)}`}
          style={getNodeTextStyle(lane.roleLabel, normalizedSearchQuery)}
        >
          {lane.roleLabel}
        </div>
        <div
          className={`mt-1 text-[14px] leading-[1.3] ${getTextClassName(changeTypes.approvals)}`}
          style={getNodeTextStyle(lane.approvals, normalizedSearchQuery)}
        >
          {lane.approvals}
        </div>
      </div>

      {lanePrincipals.map((principal, principalIndex) => {
        const center = centerX + principalOffsets[principalIndex];
        const principalChangeType = getPrincipalChangeType(principal, lane);

        return (
          <div
            key={`${lane.key}-${principal.name}`}
            className="absolute flex flex-col items-center text-center"
            style={{
              left: `${center - principalBox.width / 2}px`,
              top: `${rowY.principals}px`,
              width: `${principalBox.width}px`,
              minHeight: `${principalBox.height}px`,
            }}
          >
            <Image
              src={userIcon}
              alt=""
              className={`mt-1 h-10 w-auto ${getIconClassName(principalChangeType)}`}
              style={{
                filter: getIconFilter(principalChangeType),
                width: "auto",
              }}
              draggable={false}
            />
            <div
              className={`mt-2 text-[16px] leading-[1.3] ${getTextClassName(principalChangeType)}`}
              style={getNodeTextStyle(principal.name, normalizedSearchQuery)}
            >
              {principal.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
