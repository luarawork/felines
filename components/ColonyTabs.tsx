// Generic accessible tab switcher used to organize the colony detail
// page into sections (overview, cats, timeline, caretaker letter)
// instead of one long scroll. Purely presentational — each tab's content
// is rendered as a React node passed in by the parent.
"use client";

import { useRef, useState } from "react";

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export default function ColonyTabs({
  tabs,
  footer,
  defaultTabId,
}: {
  tabs: Tab[];
  // Rendered below the tab panels, remounted (via the key on its
  // wrapper) every time the active tab changes — used so a form left
  // open below the tabs (e.g. the "Sinalizar" flag form) doesn't stay
  // open while the visitor is looking at an unrelated tab. A plain node
  // rather than a render-prop function: this component is rendered from
  // a server component, which can't pass functions across the boundary.
  footer?: React.ReactNode;
  defaultTabId?: string;
}) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId ?? tabs[0]?.id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = (index + 1) % tabs.length;
      setActiveTabId(tabs[next].id);
      tabRefs.current[next]?.focus();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prev = (index - 1 + tabs.length) % tabs.length;
      setActiveTabId(tabs[prev].id);
      tabRefs.current[prev]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveTabId(tabs[0].id);
      tabRefs.current[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveTabId(tabs[tabs.length - 1].id);
      tabRefs.current[tabs.length - 1]?.focus();
    }
  }

  return (
    <div className="mt-8">
      <div role="tablist" aria-label="Seções da colônia" className="flex flex-wrap gap-2 border-b border-felines-border">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTabId(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
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
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== activeTabId}
          className="pt-6"
        >
          {tab.content}
        </div>
      ))}

      {footer && <div key={activeTabId}>{footer}</div>}
    </div>
  );
}
