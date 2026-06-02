"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";

interface GraphTab {
  id: string;
  label: string;
  closable?: boolean;
  editable?: boolean;
}

interface WorkspaceBottomBarProps {
  leftWidthPx: number;
  tabs: GraphTab[];
  activeTabId: string;
  addIcon: StaticImageData;
  onTabSelect: (tabId: string) => void;
  onTabRename: (tabId: string, nextLabel: string) => void;
  onTabAdd: () => void;
  onTabDelete: (tabId: string) => void;
}

export function WorkspaceBottomBar({
  leftWidthPx,
  tabs,
  activeTabId,
  addIcon,
  onTabSelect,
  onTabRename,
  onTabAdd,
  onTabDelete,
}: WorkspaceBottomBarProps) {
  const clampedLeftWidth = Math.max(0, leftWidthPx);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingTabId) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingTabId]);

  const commitRename = () => {
    if (!editingTabId) return;

    const nextLabel = draftLabel.trim();
    if (nextLabel) {
      onTabRename(editingTabId, nextLabel);
    }

    setEditingTabId(null);
    setDraftLabel("");
  };

  return (
    <div className="flex h-[25px] w-full border-t border-[var(--dark-gray)] bg-white">
      <div
        className="h-full border-r border-[var(--dark-gray)] bg-white"
        style={{ width: `${clampedLeftWidth}px` }}
      />
      <div className="flex h-full flex-1 items-center gap-2 overflow-hidden bg-[var(--background-color)] pr-2">
        <div className="flex h-full items-center overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const isEditing = tab.id === editingTabId;
            const isEditable = tab.editable ?? true;
            const isClosable = tab.closable ?? true;

            return (
              <div
                key={tab.id}
                className={`flex h-full items-center border-r border-[var(--dark-gray)] text-[12px] ${
                  isActive
                    ? "bg-white text-black"
                    : "bg-[var(--background-color)] text-[var(--dark-gray)]"
                } ${isEditing ? "min-w-[188px]" : "min-w-[108px]"}`}
              >
                <button
                  type="button"
                  onClick={() => onTabSelect(tab.id)}
                  onDoubleClick={() => {
                    if (!isEditable) return;
                    setEditingTabId(tab.id);
                    setDraftLabel(tab.label);
                  }}
                  className="flex h-full min-w-0 flex-1 items-center px-4 text-left"
                >
                  {isEditing ? (
                    <input
                      ref={inputRef}
                      value={draftLabel}
                      onChange={(event) => setDraftLabel(event.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          commitRename();
                        }
                        if (event.key === "Escape") {
                          setEditingTabId(null);
                          setDraftLabel("");
                        }
                      }}
                      className="w-full min-w-[140px] bg-transparent outline-none"
                    />
                  ) : (
                    <span className="truncate">{tab.label}</span>
                  )}
                </button>
                {tabs.length > 1 && isClosable ? (
                  <button
                    type="button"
                    aria-label={`Delete ${tab.label}`}
                    onClick={() => onTabDelete(tab.id)}
                    className="flex h-full w-7 items-center justify-center text-[12px] text-[var(--dark-gray)] transition-colors duration-150 hover:bg-[var(--gray-highlight)] hover:text-black"
                  >
                    x
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Add graph tab"
          onClick={onTabAdd}
          className="flex h-[18px] w-[18px] items-center justify-center bg-transparent"
        >
          <Image src={addIcon} alt="" className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
