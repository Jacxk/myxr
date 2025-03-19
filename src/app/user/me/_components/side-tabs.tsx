"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";

type SideTab = {
  activeTab: string | null;
  setActiveTab: (id: string) => void;
};

const SideTabContext = createContext<SideTab>({
  activeTab: null,
  setActiveTab: () => {},
});

export function SideTab({
  children,
  className = "",
  defaultTab,
}: Readonly<{ children: ReactNode; className?: string; defaultTab?: string }>) {
  const [activeTab, setActiveTab] = useState<string | null>(defaultTab ?? null);
  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return (
    <SideTabContext.Provider value={value}>
      <div className={`flex ${className}`}>{children}</div>
    </SideTabContext.Provider>
  );
}

export function SideTabTrigger({
  id,
  children,
  className = "",
}: Readonly<{ id: string; children: ReactNode; className?: string }>) {
  const { activeTab, setActiveTab } = useContext(SideTabContext);

  return (
    <Button
      className={`w-full p-6 ${className}`}
      onClick={() => setActiveTab(id)}
      variant={activeTab === id ? "default" : "outline"}
    >
      {children}
    </Button>
  );
}

export function SideTabContent({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const { activeTab } = useContext(SideTabContext);
  return activeTab === id ? (
    <div className={`flex-1 p-4 ${className}`}>{children}</div>
  ) : null;
}
