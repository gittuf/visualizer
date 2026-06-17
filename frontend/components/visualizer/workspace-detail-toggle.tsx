"use client";

import Image, { type StaticImageData } from "next/image";

interface WorkspaceDetailToggleProps {
  isCollapsed: boolean;
  leftIcon: StaticImageData;
  rightIcon: StaticImageData;
  onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function WorkspaceDetailToggle({
  isCollapsed,
  leftIcon,
  rightIcon,
  onToggle,
}: WorkspaceDetailToggleProps) {
  const label = isCollapsed ? "Expand detail panel" : "Collapse detail panel";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute left-0 top-1/2 z-20 flex h-15 w-[35px] -translate-y-1/2 items-center justify-center border border-(--secondary-color) bg-(--background-color) hover:bg-(--logo-blue) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)"
      aria-label={label}
      title={label}
    >
      <Image
        src={isCollapsed ? rightIcon : leftIcon}
        alt=""
        className="h-8 w-8"
      />
    </button>
  );
}
