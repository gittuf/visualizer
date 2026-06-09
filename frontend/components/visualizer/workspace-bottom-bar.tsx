"use client";

import Image, { type StaticImageData } from "next/image";

interface WorkspaceBottomBarProps {
  leftWidthPx: number;
  currentGraphLabel: string;
  addIcon: StaticImageData;
}

export function WorkspaceBottomBar({
  leftWidthPx,
  currentGraphLabel,
  addIcon,
}: WorkspaceBottomBarProps) {
  const clampedLeftWidth = Math.max(0, leftWidthPx);

  return (
    <div className="flex h-[25px] w-full border-t border-[#6B7280] bg-white">
      <div
        className="h-full border-r border-[#6B7280] bg-white"
        style={{ width: `${clampedLeftWidth}px` }}
      />
      <div className="flex h-full flex-1 items-center gap-2 bg-[#DBE3E5] pr-2">
        <div className="flex h-full items-center border-r border-[#6B7280] bg-white px-6 text-[12px] text-black">
          {currentGraphLabel}
        </div>
        <button
          type="button"
          aria-label="Add graph tab"
          className="flex h-[18px] w-[18px] items-center justify-center bg-transparent"
        >
          <Image src={addIcon} alt="" className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
