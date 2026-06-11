"use client";

import type React from "react";
import { detailColors } from "@/components/visualizer/detail/detail-primitives.types";

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
