"use client";

import Image, { type StaticImageData } from "next/image";
import { Button } from "@/components/ui/button";

interface WorkspaceActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: StaticImageData;
  size?: "default" | "sm";
}

export function WorkspaceActionButton({
  label,
  onClick,
  disabled = false,
  icon,
  size = "sm",
}: WorkspaceActionButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={onClick}
      disabled={disabled}
      className="rounded-[5px] border-[#04080E] bg-white px-3 text-[14px] font-normal text-black hover:bg-[#F7F7F7]"
    >
      {icon ? <Image src={icon} alt="" className="h-4 w-4" /> : null}
      <span>{label}</span>
    </Button>
  );
}
