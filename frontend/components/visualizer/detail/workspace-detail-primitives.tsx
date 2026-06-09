"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import arrowDropDownIcon from "@/assets/arrow_drop_down.png";
import commitIcon from "@/assets/commit.png";
import emptyIcon from "@/assets/empty.png";
import greenCheckboxIcon from "@/assets/green_check_box.png";
import userIcon from "@/assets/user.png";

export interface SelectOption {
  label: string;
  value?: string;
  icon?: StaticImageData;
}

export interface MetricCardData {
  value: string;
  label: string;
}

export const detailColors = {
  bullet: "#BAD1EA",
  chip: "#A2C5E8",
  summaryCard: "#DBE3E5",
} as const;

export function SectionDivider() {
  return <div className="border-b border-[#9CA3AF]" />;
}

export function SectionBulletLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: detailColors.bullet }}
      />
      <span className="text-[13px] font-medium text-black">{label}</span>
    </div>
  );
}

export function ValueChip({ label }: { label: string }) {
  return (
    <div
      className="inline-flex items-center border border-[#6B7280] px-2 py-1 text-[11px] font-medium text-black"
      style={{ backgroundColor: detailColors.chip }}
    >
      {label}
    </div>
  );
}

export function PanelSection({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-3 py-4 ${className}`}>
      <SectionBulletLabel label={label} />
      {children}
      <SectionDivider />
    </section>
  );
}

export function StaticValueRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <section className="space-y-3 py-4">
      <div className="flex items-center justify-between gap-4">
        <SectionBulletLabel label={label} />
        <span className="text-right text-[13px] leading-[1.2] text-[#7E7E7E]">
          {value}
        </span>
      </div>
      <SectionDivider />
    </section>
  );
}

export function SelectField({
  options,
  selectedLabel,
  displayLabel,
  chips = [],
  fullWidth = false,
  className = "",
  onChange,
}: {
  options: SelectOption[];
  selectedLabel?: string;
  displayLabel?: string;
  chips?: string[];
  fullWidth?: boolean;
  className?: string;
  onChange?: (label: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [touchedOptionValue, setTouchedOptionValue] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const getOptionValue = (option: SelectOption) => option.value ?? option.label;
  const selectedOption = useMemo(
    () =>
      options.find((option) => getOptionValue(option) === selectedLabel) ?? options[0],
    [options, selectedLabel],
  );

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setTouchedOptionValue(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${fullWidth ? "max-w-none" : "ml-auto max-w-[220px]"} ${className}`}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsOpen((open) => {
              const nextOpen = !open;
              if (!nextOpen) {
                setTouchedOptionValue(null);
              }
              return nextOpen;
            });
          }}
          className={`flex h-9 w-full items-center justify-between rounded-[4px] border border-[#8B949E] bg-white px-3 text-left text-[12px] text-[#7E7E7E] transition-[border-color,box-shadow] duration-150 ${
            isOpen ? "border-[#61A1D1] shadow-[0_0_0_1px_rgba(97,161,209,0.18)]" : ""
          }`}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.icon ? (
              <Image src={selectedOption.icon} alt="" className="h-4 w-4" />
            ) : null}
            <span className="truncate">
              {displayLabel ?? selectedLabel ?? selectedOption?.label}
            </span>
          </span>
          <Image
            src={arrowDropDownIcon}
            alt=""
            className={`h-5 w-5 transition-transform duration-150 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isOpen ? (
          <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-full origin-top overflow-hidden rounded-[4px] border border-[#8B949E] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)] animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="relative">
              <div className="max-h-44 overflow-y-auto overscroll-contain scroll-smooth">
                {options.map((option) => {
                  const optionValue = getOptionValue(option);
                  const isSelected = optionValue === getOptionValue(selectedOption);
                  const isTouched = touchedOptionValue === optionValue;

                  return (
                    <button
                      key={optionValue}
                      type="button"
                      onClick={() => {
                        onChange?.(optionValue);
                        setIsOpen(false);
                        setTouchedOptionValue(null);
                      }}
                      onMouseEnter={() => setTouchedOptionValue(optionValue)}
                      onMouseLeave={() => setTouchedOptionValue(null)}
                      onPointerDown={() => setTouchedOptionValue(optionValue)}
                      onPointerUp={() => setTouchedOptionValue(null)}
                      onFocus={() => setTouchedOptionValue(optionValue)}
                      onBlur={() => setTouchedOptionValue(null)}
                      className={`relative flex min-h-10 w-full items-center gap-2 border-b border-[#E5E7EB] px-3 py-2.5 text-left text-[12px] transition-[background-color,border-color,color,box-shadow] duration-150 last:border-b-0 ${
                        isSelected
                          ? "bg-[#F3F4F4] text-black"
                          : "bg-white text-[#7E7E7E] hover:bg-white hover:text-black"
                      } ${
                        isTouched ? "z-10 border border-[#61A1D1] shadow-[inset_0_0_0_1px_#61A1D1]" : ""
                      }`}
                    >
                      {option.icon ? (
                        <Image src={option.icon} alt="" className="h-4 w-4 flex-none" />
                      ) : null}
                      <span className="truncate">{option.label}</span>
                    </button>
                  );
                })}
              </div>
              {options.length > 4 ? (
                <>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-white to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white to-transparent" />
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      {chips.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-3">
          {chips.map((chip, index) => (
            <ValueChip key={`${chip}-${index}`} label={chip} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function InlineSelectRow({
  label,
  options,
  chips = [],
  selectedLabel,
  onChange,
}: {
  label: string;
  options: SelectOption[];
  chips?: string[];
  selectedLabel?: string;
  onChange?: (label: string) => void;
}) {
  return (
    <section className="space-y-3 py-4">
      <div className="flex items-center justify-between gap-4">
        <SectionBulletLabel label={label} />
        <SelectField
          options={options}
          selectedLabel={selectedLabel}
          className="w-[220px]"
          onChange={onChange}
        />
      </div>
      {chips.length > 0 ? (
        <div className="flex justify-end">
          <div className="flex w-[220px] flex-wrap gap-3">
            {chips.map((chip, index) => (
              <ValueChip key={`${chip}-${index}`} label={chip} />
            ))}
          </div>
        </div>
      ) : null}
      <SectionDivider />
    </section>
  );
}

export function SummaryMetricGrid({ items }: { items: MetricCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="min-h-[78px] space-y-2 px-4 py-3"
          style={{ backgroundColor: detailColors.summaryCard }}
        >
          <div className="text-[16px] font-semibold text-black">{item.value}</div>
          <div className="text-[12px] text-[#7E7E7E]">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export function QueryUserCard({ name }: { name: string }) {
  return (
    <div className="flex w-[72px] flex-col items-center gap-1">
      <div className="flex h-[64px] w-[64px] items-center justify-center">
        <Image src={userIcon} alt="" className="h-10 w-10" />
      </div>
      <span className="text-[12px] text-black">{name}</span>
    </div>
  );
}

export function CommitHistoryItem({
  commitId,
  message,
  author,
  isSelected = false,
  isTouched = false,
  onSelect,
  onTouch,
}: {
  commitId: number;
  message: string;
  author: string;
  isSelected?: boolean;
  isTouched?: boolean;
  onSelect: (commitId: number) => void;
  onTouch: (commitId: number | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(commitId)}
      onMouseEnter={() => onTouch(commitId)}
      onMouseLeave={() => onTouch(null)}
      onPointerDown={() => onTouch(commitId)}
      onPointerUp={() => onTouch(null)}
      onFocus={() => onTouch(commitId)}
      onBlur={() => onTouch(null)}
      className={`flex w-full items-start gap-2 border-b border-[#BDBDBD] px-1 py-3 text-left ${
        isSelected ? "bg-[#F3F4F4]" : "bg-white"
      } ${isTouched ? "border border-[#61A1D1]" : ""}`}
    >
      <Image src={commitIcon} alt="" className="mt-1 h-4 w-4 flex-none" />
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="w-full truncate whitespace-nowrap text-[12px] text-black">
          {message}
        </div>
        <div className="text-[10px] text-[#8B949E]">{author}</div>
      </div>
    </button>
  );
}

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
    <div className="flex w-full overflow-hidden rounded-[2px] border border-[#8B949E]">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange?.(option)}
          className={`flex-1 px-4 py-2 text-[12px] font-medium transition-colors duration-150 ${
            option === selected ? "bg-[#8B8B8B] text-white" : "bg-white text-black"
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
}: {
  label: string;
  enabled: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 pl-4 text-left"
    >
      <span className="text-[12px] text-black">{label}</span>
      <div
        className={`relative h-5 w-8 rounded-full border border-[#6B7280] transition-colors duration-150 ${
          enabled ? "bg-white" : "bg-white opacity-60"
        }`}
      >
        <div
          className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-[#6B7280] bg-white transition-[left,right] duration-150 ${
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
}: {
  label: string;
  checked: boolean;
  onToggle?: () => void;
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
      <span className={`text-[12px] ${checked ? "text-black" : "text-[#7E7E7E]"}`}>
        {label}
      </span>
    </button>
  );
}

export function StatusRow({
  icon,
  label,
  value,
}: {
  icon: StaticImageData;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <Image src={icon} alt="" className="h-4 w-4" />
      <span className="text-[#7E7E7E]">
        {label}
        {value ? `: ${value}` : ""}
      </span>
    </div>
  );
}
