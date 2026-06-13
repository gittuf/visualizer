export interface HistoryTimelineCommit {
  id: string;
  hash: string;
  message?: string;
  author: string;
  authorLabel?: string;
  date: string;
}

export type HistorySortField = "date" | "author";
