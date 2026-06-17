"use client";

import type { StaticImageData } from "next/image";

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
