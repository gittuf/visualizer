"use client";

import Image, { type StaticImageData } from "next/image";
import spinnerIcon from "@/assets/spinner.png";
import { Button } from "@/components/ui/button";

interface WorkspaceActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: StaticImageData;
  size?: "default" | "sm";
}

export function WorkspaceActionButton({
  label,
  onClick,
  disabled = false,
  loading = false,
  icon,
  size = "sm",
}: WorkspaceActionButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className="rounded-[5px] border-(--tertiary-color) bg-white px-3 text-[14px] font-normal text-black hover:bg-(--gray-highlight)"
    >
      {loading ? (
        <Image
          src={spinnerIcon}
          alt=""
          className="h-4 w-4 animate-spin"
        />
      ) : icon ? (
        <Image src={icon} alt="" className="h-4 w-4" />
      ) : null}
      <span>{label}</span>
    </Button>
  );
}
