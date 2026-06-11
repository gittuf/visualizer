"use client";

import Image, { type StaticImageData } from "next/image";
import emptyIcon from "@/assets/empty.png";
import greenCheckboxIcon from "@/assets/green_check_box.png";
import { SearchHighlightText } from "@/components/visualizer/detail/detail-text-sections";

export function SegmentedControl({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string;
  onChange?: (option: string) => void;
}) {
  return (
    <div className="flex w-full overflow-hidden rounded-xs border border-(--secondary-color)">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange?.(option)}
          className={`flex-1 px-4 py-2 text-[12px] font-medium transition-colors duration-150 ${
            option === selected ? "bg-(--dark-gray) text-white" : "bg-white text-black"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function ToggleRow({
  label,
  enabled,
  onToggle,
  searchQuery,
}: {
  label: string;
  enabled: boolean;
  onToggle?: () => void;
  searchQuery?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 pl-4 text-left"
    >
      <SearchHighlightText
        text={label}
        query={searchQuery}
        className="text-[12px] text-black"
      />
      <div
        className={`relative h-5 w-8 rounded-full border border-(--dark-gray) transition-colors duration-150 ${
          enabled ? "bg-(--primary-color)" : "bg-white opacity-60"
        }`}
      >
        <div
          className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-(--dark-gray) bg-white transition-[left,right] duration-150 ${
            enabled ? "right-1" : "left-1"
          }`}
        />
      </div>
    </button>
  );
}

export function CheckboxRow({
  label,
  checked,
  onToggle,
  searchQuery,
}: {
  label: string;
  checked: boolean;
  onToggle?: () => void;
  searchQuery?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-3 pl-4 text-left"
    >
      <Image
        src={checked ? greenCheckboxIcon : emptyIcon}
        alt=""
        className="h-4 w-4"
      />
      <SearchHighlightText
        text={label}
        query={searchQuery}
        className={`text-[12px] ${checked ? "text-black" : "text-(--dark-gray)"}`}
      />
    </button>
  );
}

export function StatusRow({
  icon,
  label,
  value,
  searchQuery,
}: {
  icon: StaticImageData;
  label: string;
  value?: string;
  searchQuery?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <Image src={icon} alt="" className="h-4 w-4" />
      <SearchHighlightText
        text={`${label}${value ? `: ${value}` : ""}`}
        query={searchQuery}
        className="text-(--dark-gray)"
      />
    </div>
  );
}
