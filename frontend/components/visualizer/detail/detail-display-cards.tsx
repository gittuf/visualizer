"use client";

import Image from "next/image";
import commitIcon from "@/assets/commit.png";
import userIcon from "@/assets/user.png";
import {
  detailColors,
  type MetricCardData,
} from "@/components/visualizer/detail/detail-primitives.types";
import { SearchHighlightText } from "@/components/visualizer/detail/detail-text-sections";

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
