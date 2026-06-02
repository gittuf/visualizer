"use client";

import Image, { type StaticImageData } from "next/image";

interface WorkspaceMenuItemProps {
  label: string;
  icon: StaticImageData;
  isActive: boolean;
  isCompact: boolean;
  onClick: () => void;
}

export function WorkspaceMenuItem({
  label,
  icon,
  isActive,
  isCompact,
  onClick,
}: WorkspaceMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center rounded-[5px] px-3 py-4 text-left text-[15px] text-black transition-colors ${
        isCompact ? "justify-center" : "gap-3"
      } ${isActive ? "bg-[#D8EAFB]" : "hover:bg-[#F3F6F9]"}`}
      title={isCompact ? label : undefined}
    >
      <Image src={icon} alt="" className="h-[18px] w-[18px]" />
      {!isCompact ? <span className="whitespace-nowrap">{label}</span> : null}
    </button>
  );
}
