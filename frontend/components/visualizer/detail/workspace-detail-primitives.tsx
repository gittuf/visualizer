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
  bullet: "var(--secondary-color)",
  chip: "var(--primary-color)",
  summaryCard: "var(--background-color)",
} as const;

export function SearchHighlightText({
  text,
  query,
  className = "",
}: {
  text: string;
  query?: string;
  className?: string;
}) {
  const normalizedQuery = query?.trim().toLowerCase() ?? "";

  if (!normalizedQuery) {
    return <span className={className}>{text}</span>;
  }

  const lowerText = text.toLowerCase();
  const parts: Array<{ value: string; matched: boolean }> = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    const matchIndex = lowerText.indexOf(normalizedQuery, currentIndex);

    if (matchIndex < 0) {
      parts.push({ value: text.slice(currentIndex), matched: false });
      break;
    }

    if (matchIndex > currentIndex) {
      parts.push({
        value: text.slice(currentIndex, matchIndex),
        matched: false,
      });
    }

    parts.push({
      value: text.slice(matchIndex, matchIndex + normalizedQuery.length),
      matched: true,
    });

    currentIndex = matchIndex + normalizedQuery.length;
  }

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.matched ? (
          <span
            key={`${part.value}-${index}`}
            className="rounded-xs text-(--modified-color)"
            style={{ backgroundColor: "var(--selected-color)" }}
          >
            {part.value}
          </span>
        ) : (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        ),
      )}
    </span>
  );
}

export function SectionDivider() {
  return <div className="border-b border-(--secondary-color)" />;
}

export function SectionBulletLabel({
  label,
  searchQuery,
}: {
  label: string;
  searchQuery?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: detailColors.bullet }}
      />
      <SearchHighlightText
        text={label}
        query={searchQuery}
        className="text-[13px] font-medium text-black"
      />
    </div>
  );
}

export function ValueChip({
  label,
  searchQuery,
}: {
  label: string;
  searchQuery?: string;
}) {
  return (
    <div
      className="inline-flex items-center border border-(--dark-gray) px-2 py-1 text-[11px] font-medium text-black"
      style={{ backgroundColor: detailColors.chip }}
    >
      <SearchHighlightText text={label} query={searchQuery} />
    </div>
  );
}

export function PanelSection({
  label,
  children,
  className = "",
  searchQuery,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  searchQuery?: string;
}) {
  return (
    <section className={`space-y-3 py-4 ${className}`}>
      <SectionBulletLabel label={label} searchQuery={searchQuery} />
      {children}
      <SectionDivider />
    </section>
  );
}

export function StaticValueRow({
  label,
  value,
  searchQuery,
}: {
  label: string;
  value: string;
  searchQuery?: string;
}) {
  return (
    <section className="space-y-3 py-4">
      <div className="flex items-center justify-between gap-4">
        <SectionBulletLabel label={label} searchQuery={searchQuery} />
        <SearchHighlightText
          text={value}
          query={searchQuery}
          className="text-right text-[13px] leading-[1.2] text-(--dark-gray)"
        />
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
      className={`${fullWidth ? "max-w-none" : "ml-auto max-w-55"} ${className}`}
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
          className={`flex h-9 w-full items-center justify-between rounded-sm border bg-white px-3 text-left text-[12px] text-(--dark-gray) transition-[border-color,box-shadow] duration-150 ${
            isOpen ? "border-(--modified-color)" : "border-(--secondary-color)"
          }`}
          style={
            isOpen
              ? { boxShadow: "0 0 0 1px var(--modified-color-18)" }
              : undefined
          }
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
          <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-full origin-top overflow-hidden rounded-sm border border-(--secondary-color) bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)] animate-in fade-in-0 zoom-in-95 duration-150">
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
                      className={`relative flex min-h-10 w-full items-center gap-2 border-b border-(--gray-highlight) px-3 py-2.5 text-left text-[12px] transition-[background-color,border-color,color,box-shadow] duration-150 last:border-b-0 ${
                        isSelected
                          ? "bg-(--gray-highlight) text-black"
                          : "bg-white text-(--dark-gray) hover:bg-white hover:text-black"
                      } ${isTouched ? "z-10 border border-(--modified-color)" : ""}`}
                      style={
                        isTouched
                          ? { boxShadow: "inset 0 0 0 1px var(--modified-color)" }
                          : undefined
                      }
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
  searchQuery,
}: {
  label: string;
  options: SelectOption[];
  chips?: string[];
  selectedLabel?: string;
  onChange?: (label: string) => void;
  searchQuery?: string;
}) {
  return (
    <section className="space-y-3 py-4">
      <div className="flex items-center justify-between gap-4">
        <SectionBulletLabel label={label} searchQuery={searchQuery} />
        <SelectField
          options={options}
          selectedLabel={selectedLabel}
          className="w-55"
          onChange={onChange}
        />
      </div>
      {chips.length > 0 ? (
        <div className="flex justify-end">
          <div className="flex w-55 flex-wrap gap-3">
            {chips.map((chip, index) => (
              <ValueChip
                key={`${chip}-${index}`}
                label={chip}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </div>
      ) : null}
      <SectionDivider />
    </section>
  );
}

export function SummaryMetricGrid({
  items,
  searchQuery,
}: {
  items: MetricCardData[];
  searchQuery?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="min-h-[78px] space-y-2 px-4 py-3"
          style={{ backgroundColor: detailColors.summaryCard }}
        >
          <SearchHighlightText
            text={item.value}
            query={searchQuery}
            className="block truncate whitespace-nowrap text-[16px] font-semibold text-black"
          />
          <SearchHighlightText
            text={item.label}
            query={searchQuery}
            className="block truncate whitespace-nowrap text-[12px] text-(--dark-gray)"
          />
        </div>
      ))}
    </div>
  );
}

export function QueryUserCard({
  name,
  searchQuery,
}: {
  name: string;
  searchQuery?: string;
}) {
  return (
    <div className="flex w-18 flex-col items-center gap-1">
      <div className="flex size-16 items-center justify-center">
        <Image
          src={userIcon}
          alt=""
          className="h-10 w-auto"
          style={{ width: "auto" }}
        />
      </div>
      <SearchHighlightText
        text={name}
        query={searchQuery}
        className="text-[12px] text-black"
      />
    </div>
  );
}

export function CommitHistoryItem({
  commitId,
  message,
  author,
  searchQuery = "",
  isSelected = false,
  isTouched = false,
  onSelect,
  onTouch,
}: {
  commitId: number;
  message: string;
  author: string;
  searchQuery?: string;
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
      className={`flex w-full items-start gap-2 border-b border-(--secondary-color) px-1 py-3 text-left ${
        isSelected ? "bg-(--gray-highlight)" : "bg-white"
      } ${isTouched ? "border border-(--modified-color)" : ""}`}
    >
      <Image src={commitIcon} alt="" className="mt-1 h-4 w-4 flex-none" />
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="w-full truncate whitespace-nowrap text-[12px] text-black">
          <SearchHighlightText text={message} query={searchQuery} />
        </div>
        <div className="text-[10px] text-(--dark-gray)">
          <SearchHighlightText text={author} query={searchQuery} />
        </div>
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
