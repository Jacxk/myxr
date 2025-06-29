"use client";

import { Castle, Flag, Heart, Trash, Volume2 } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import React from "react";
import { cn } from "~/lib/utils";

export function TabLink({
  children,
  path,
  className = "",
}: Readonly<{
  children: React.ReactNode;
  path: string;
  className?: string;
}>) {
  const segment = useSelectedLayoutSegment();
  const splitPath = path.split("/");
  const isActive = segment === splitPath[splitPath.length - 1];

  return (
    <Link
      href={path}
      className={cn(
        "hover:bg-secondary block rounded-md p-2 px-4",
        isActive ? "bg-secondary/50 text-primary/75" : "text-primary/50",
        className,
      )}
      prefetch={false}
    >
      {children}
    </Link>
  );
}

interface UserTabItem {
  path: string;
  label: string;
  icon: React.JSX.Element;
  className?: string;
}

export function UserTabsAccount() {
  const segment = useSelectedLayoutSegment();

  const tabs: UserTabItem[] = [
    {
      path: "sounds",
      label: "My Sounds",
      icon: <Volume2 className="shrink-0" />,
    },
    {
      path: "liked-sounds",
      label: "Liked Sounds",
      icon: <Heart className="shrink-0" />,
    },
    {
      path: "guilds",
      label: "Guilds",
      icon: <Castle className="shrink-0" />,
    },
    {
      path: "reports",
      label: "Reports",
      icon: <Flag className="shrink-0" />,
    },
    {
      path: "delete-account",
      label: "Delete Account",
      icon: <Trash />,
      className: "text-red-500 hover:bg-red-500/20",
    },
  ];

  const activeTab = tabs.find((tab) => tab.path === segment);

  return (
    <>
      <div className="flex flex-row justify-center gap-2 sm:w-1/2 sm:flex-col sm:justify-start lg:w-1/4 shrink-0">
        {tabs.map((tab) => (
          <TabLink
            key={tab.path}
            path={`/user/me/${tab.path}`}
            className={cn("flex flex-row gap-2", tab.className)}
          >
            {tab.icon}
            <span className="hidden sm:block">{tab.label}</span>
          </TabLink>
        ))}
      </div>
      <span className="flex-1 text-center text-lg sm:hidden">
        {activeTab?.label}
      </span>
    </>
  );
}
