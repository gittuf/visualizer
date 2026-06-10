"use client";

import { WorkspaceSearchField } from "@/components/visualizer/workspace-search-field";
import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

interface WorkspacePanelHeaderProps {
  title: string;
  placeholder: string;
  searchIcon: StaticImageData;
  titleIcon?: StaticImageData;
  className?: string;
  centerSlot?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function WorkspacePanelHeader({
  title,
  placeholder,
  searchIcon,
  titleIcon,
  className = "bg-white",
  centerSlot,
  searchValue,
  onSearchChange,
}: WorkspacePanelHeaderProps) {
  return (
    <div
      className={`relative flex min-h-[36px] min-w-0 items-center justify-between gap-3 border-b border-[var(--secondary-color)] px-3 ${className}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {titleIcon ? (
          <Image src={titleIcon} alt="" className="h-[18px] w-[18px]" />
        ) : null}
        <h3 className="truncate text-[18px] font-normal text-black">{title}</h3>
      </div>
      {centerSlot ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="pointer-events-auto">{centerSlot}</div>
        </div>
      ) : null}
      <WorkspaceSearchField
        placeholder={placeholder}
        icon={searchIcon}
        value={searchValue}
        onChange={onSearchChange}
      />
    </div>
  );
}
