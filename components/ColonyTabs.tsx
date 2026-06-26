// Generic accessible tab switcher used to organize the colony detail
// page into sections (overview, cats, timeline, caretaker letter)
// instead of one long scroll. Purely presentational — each tab's content
// is rendered as a React node passed in by the parent.
"use client";

import { useState } from "react";

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export default function ColonyTabs({ tabs }: { tabs: Tab[] }) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id);

  return (
    <div className="mt-8">
      <div role="tablist" aria-label="Seções da colônia" className="flex flex-wrap gap-2 border-b border-felines-border">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTabId(tab.id)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-felines-accent text-felines-accent-hover"
                  : "border-transparent text-felines-text-secondary hover:text-felines-accent"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" hidden={tab.id !== activeTabId} className="pt-6">
          {tab.content}
        </div>
      ))}
    </div>
  );
}
