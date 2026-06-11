"use client";

import Image from "next/image";
import spinnerIcon from "@/assets/spinner.png";
import { detailColors } from "@/components/visualizer/detail/detail-primitives.types";

interface DetailActionButtonProps {
  label: string;
  onClick: () => void;
  loading?: boolean;
  className?: string;
}

export function DetailActionButton({
  label,
  onClick,
  loading = false,
  className = "",
}: DetailActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-lg border border-(--secondary-color) px-4 py-2.5 text-[13px] font-medium text-black disabled:opacity-90 ${className}`}
      style={{ backgroundColor: detailColors.bullet }}
    >
      {loading ? (
        <Image
          src={spinnerIcon}
          alt=""
          className="h-4 w-4 animate-spin"
        />
      ) : null}
      <span>{label}</span>
    </button>
  );
}
