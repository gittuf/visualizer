"use client";

import Image, { type StaticImageData } from "next/image";
import { Input } from "@/components/ui/input";

interface WorkspaceSearchFieldProps {
  placeholder: string;
  icon: StaticImageData;
  value?: string;
  onChange?: (value: string) => void;
}

export function WorkspaceSearchField({
  placeholder,
  icon,
  value,
  onChange,
}: WorkspaceSearchFieldProps) {
  return (
    <div className="relative min-w-0 w-full max-w-55 shrink">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-5 rounded-[5px] border-(--tertiary-color) pr-8 text-[12px] focus-visible:ring-0 focus-visible:ring-offset-0 md:h-5 md:text-[12px]"
      />
      <Image
        src={icon}
        alt=""
        className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-80"
      />
    </div>
  );
}
