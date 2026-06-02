"use client";

import Image from "next/image";
import branchIcon from "@/assets/branch.png";
import fileIcon from "@/assets/file.png";
import usersIcon from "@/assets/Users.png";

interface PolicyGraphCanvasProps {
  zoom: number;
  viewportWidth: number;
  viewportHeight: number;
}

const layoutWidth = 980;
const layoutHeight = 980;
const boundary = { x: 80, y: 60, width: 820, height: 840 };
const laneCenters = [310, 670];
const principalOffsets = [-110, 0, 110];
const rowY = {
  branch: 120,
  file: 300,
  role: 500,
  principals: 760,
};
const lanes = [
  {
    key: "left",
    pathLabel: "src/**",
    roleLabel: "Authorized users",
    approvals: "Requires: 2 approvals",
  },
  {
    key: "right",
    pathLabel: "docs/**",
    roleLabel: "Authorized users",
    approvals: "Requires: 2 approvals",
  },
] as const;
const principalNames = ["Alice", "Carol", "Bob"];
const branchBox = { width: 140, height: 92 };
const fileBox = { width: 120, height: 118 };
const roleBox = { width: 180, height: 132 };
const principalBox = { width: 92, height: 108 };
const scrollPadding = 96;

export function PolicyGraphCanvas({
  zoom,
  viewportWidth,
  viewportHeight,
}: PolicyGraphCanvasProps) {
  const scaledWidth = layoutWidth * zoom;
  const scaledHeight = layoutHeight * zoom;
  const canvasWidth = Math.max(scaledWidth + scrollPadding * 2, viewportWidth);
  const canvasHeight = Math.max(
    scaledHeight + scrollPadding * 2,
    viewportHeight,
  );
  const canvasOffsetX =
    scaledWidth + scrollPadding * 2 <= viewportWidth
      ? (viewportWidth - scaledWidth) / 2
      : scrollPadding;
  const canvasOffsetY =
    scaledHeight + scrollPadding * 2 <= viewportHeight
      ? (viewportHeight - scaledHeight) / 2
      : scrollPadding;

  const verticalPaths = laneCenters.flatMap((centerX) => [
    {
      d: `M ${centerX} ${rowY.branch + branchBox.height} L ${centerX} ${rowY.file - 18}`,
      arrow: true,
    },
    {
      d: `M ${centerX} ${rowY.file + fileBox.height} L ${centerX} ${rowY.role - 18}`,
      arrow: true,
    },
  ]);

  const principalPaths = laneCenters.flatMap((centerX) => {
    const splitY = 660;

    return [
      {
        d: `M ${centerX - 22} ${rowY.role + roleBox.height} L ${centerX - 22} ${splitY}`,
        arrow: false,
      },
      {
        d: `M ${centerX} ${rowY.role + roleBox.height} L ${centerX} ${splitY}`,
        arrow: false,
      },
      {
        d: `M ${centerX + 22} ${rowY.role + roleBox.height} L ${centerX + 22} ${splitY}`,
        arrow: false,
      },
      {
        d: `M ${centerX - 22} ${splitY} L ${centerX - 110} ${splitY}`,
        arrow: false,
      },
      {
        d: `M ${centerX + 22} ${splitY} L ${centerX + 110} ${splitY}`,
        arrow: false,
      },
      ...principalOffsets.map((offset) => ({
        d: `M ${centerX + offset} ${splitY} L ${centerX + offset} ${rowY.principals - 18}`,
        arrow: true,
      })),
    ];
  });

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <div
        className="relative min-h-full min-w-full"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }}
      >
        <div
          className="absolute origin-top-left"
          style={{
            left: `${canvasOffsetX}px`,
            top: `${canvasOffsetY}px`,
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
        >
          <div
            className="relative origin-top-left"
            style={{
              width: `${layoutWidth}px`,
              height: `${layoutHeight}px`,
              transform: `scale(${zoom})`,
            }}
          >
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 0 ${layoutWidth} ${layoutHeight}`}
              preserveAspectRatio="xMidYMin meet"
            >
              <defs>
                <marker
                  id="policy-arrow"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                >
                  <path
                    d="M1,1 L8,5 L1,9"
                    fill="none"
                    stroke="#04080E"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </marker>
              </defs>

              <rect
                x={boundary.x}
                y={boundary.y}
                width={boundary.width}
                height={boundary.height}
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />

              {[...verticalPaths, ...principalPaths].map((path, index) => (
                <path
                  key={index}
                  d={path.d}
                  stroke="#04080E"
                  strokeWidth="1.5"
                  fill="none"
                  markerEnd={path.arrow ? "url(#policy-arrow)" : undefined}
                />
              ))}
            </svg>

            <div
              className="absolute text-[16px] font-medium leading-[1.3] text-[#7E7E7E]"
              style={{
                left: `${boundary.x + 16}px`,
                top: `${boundary.y - 4}px`,
              }}
            >
              gittuf_repo
            </div>

            {lanes.map((lane, laneIndex) => {
              const centerX = laneCenters[laneIndex];

              return (
                <div key={lane.key}>
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
                      className="mt-1 h-9 w-9 grayscale"
                      draggable={false}
                    />
                    <div className="mt-2 text-[16px] leading-[1.3] text-black">
                      Branch: main
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
                      className="mt-1 h-12 w-10 grayscale"
                      draggable={false}
                    />
                    <div className="mt-2 text-[16px] leading-[1.3] text-black">
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
                      className="mt-1 h-12 w-12 grayscale"
                      draggable={false}
                    />
                    <div className="mt-2 text-[16px] leading-[1.3] text-black">
                      {lane.roleLabel}
                    </div>
                    <div
                      className="mt-1 text-[14px] leading-[1.3]"
                      style={{ color: "#7E7E7E" }}
                    >
                      {lane.approvals}
                    </div>
                  </div>

                  {principalNames.map((name, principalIndex) => {
                    const center = centerX + principalOffsets[principalIndex];

                    return (
                      <div
                        key={`${lane.key}-${name}`}
                        className="absolute flex flex-col items-center text-center"
                        style={{
                          left: `${center - principalBox.width / 2}px`,
                          top: `${rowY.principals}px`,
                          width: `${principalBox.width}px`,
                          minHeight: `${principalBox.height}px`,
                        }}
                      >
                        <Image
                          src={usersIcon}
                          alt=""
                          className="mt-1 h-10 w-10 grayscale"
                          draggable={false}
                        />
                        <div className="mt-2 text-[16px] leading-[1.3] text-black">
                          {name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
