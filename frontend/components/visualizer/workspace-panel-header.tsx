"use client";

import { WorkspaceSearchField } from "@/components/visualizer/workspace-search-field";
import type { StaticImageData } from "next/image";

interface WorkspacePanelHeaderProps {
  title: string;
  placeholder: string;
  searchIcon: StaticImageData;
  className?: string;
}

export function WorkspacePanelHeader({
  title,
  placeholder,
  searchIcon,
  className = "bg-white",
}: WorkspacePanelHeaderProps) {
  return (
    <div
      className={`flex min-h-[36px] items-center justify-between border-b border-[#D9D9D9] px-3 ${className}`}
    >
      <h3 className="text-[18px] font-normal text-black">{title}</h3>
      <WorkspaceSearchField placeholder={placeholder} icon={searchIcon} />
    </div>
  );
}
