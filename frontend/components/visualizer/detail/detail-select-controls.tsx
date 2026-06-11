"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import arrowDropDownIcon from "@/assets/arrow_drop_down.png";
import type { SelectOption } from "@/components/visualizer/detail/detail-primitives.types";
import {
  SectionBulletLabel,
  SectionDivider,
  ValueChip,
} from "@/components/visualizer/detail/detail-text-sections";

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
              <div className="max-h-[123px] overflow-y-auto overscroll-contain scroll-smooth">
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
              {options.length > 3 ? (
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
