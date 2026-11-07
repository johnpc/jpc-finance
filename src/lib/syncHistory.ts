import { formatTimestamp } from "./dateUtils";
import { SyncRunEntity } from "./types";

export const sourceLabel = (source: string): string => {
  if (source === "plaid") return "Plaid";
  if (source === "financeKit") return "Apple Card";
  return source.charAt(0).toUpperCase() + source.slice(1);
};

export const countText = (count: number): string => {
  if (count === 0) return "No new transactions";
  return `${count} new transaction${count === 1 ? "" : "s"}`;
};

export const durationText = (ms: number): string => {
  if (ms < 1000) return "<1s";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

export const timestampText = (startedAt: string): string => {
  const date = new Date(startedAt);
  return Number.isNaN(date.getTime()) ? startedAt : formatTimestamp(date);
};

export const lastSyncText = (newest?: SyncRunEntity): string | null =>
  newest ? `Last sync at: ${timestampText(newest.startedAt)}` : null;
