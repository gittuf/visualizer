"use client";

import { WorkspaceSearchField } from "@/components/visualizer/workspace-search-field";
import Image, { type StaticImageData } from "next/image";

interface WorkspacePanelHeaderProps {
  title: string;
  placeholder: string;
  searchIcon: StaticImageData;
  titleIcon?: StaticImageData;
  className?: string;
}

export function WorkspacePanelHeader({
  title,
  placeholder,
  searchIcon,
  titleIcon,
  className = "bg-white",
}: WorkspacePanelHeaderProps) {
  return (
    <div
      className={`flex min-h-[36px] items-center justify-between border-b border-[#D9D9D9] px-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        {titleIcon ? (
          <Image src={titleIcon} alt="" className="h-[18px] w-[18px]" />
        ) : null}
        <h3 className="text-[18px] font-normal text-black">{title}</h3>
      </div>
      <WorkspaceSearchField placeholder={placeholder} icon={searchIcon} />
    </div>
  );
}
