"use client";

import { ArrowUpLeft, History, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command";
import { useSearch } from "~/context/SearchContext";

function RecentSearches() {
  const { recentSearches, search, setSearchQuery, clearRecentSearches } =
    useSearch();

  if (recentSearches.length === 0) {
    return <CommandEmpty>No recent searches</CommandEmpty>;
  }

  return (
    <>
      <CommandGroup heading="Recent">
        {recentSearches.map((query) => (
          <CommandItem
            key={query}
            onSelect={() => {
              search(query);
              setSearchQuery(query);
            }}
          >
            <History className="size-4" />
            <span className="grow">{query}</span>
            <CommandShortcut
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery(query);
              }}
            >
              <ArrowUpLeft className="size-4" />
            </CommandShortcut>
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup>
        <CommandItem onSelect={clearRecentSearches}>
          <Trash2 className="size-4" />
          <span>Clear recent searches</span>
        </CommandItem>
      </CommandGroup>
    </>
  );
}

export function SearchBar() {
  const { searchQuery, isSearching, search, setSearchQuery, setIsSearching } =
    useSearch();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.userAgent.toUpperCase().includes("MAC"));
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearching(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setIsSearching]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      search(searchQuery);
      setIsSearching(false);
    }
  };

  return (
    <div className="flex justify-end">
      <Button
        variant="outline"
        className="bg-background/30 relative h-9 w-9 gap-4 p-0 sm:h-10 sm:w-64 sm:justify-start sm:px-3 sm:py-2"
        onClick={() => setIsSearching(true)}
      >
        <Search className="size-4" />
        <span className="hidden text-sm sm:inline-flex">
          Search for sounds...
        </span>
        <kbd className="bg-muted pointer-events-none absolute top-1/2 right-1.5 hidden h-5 -translate-y-1/2 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
          <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>+ K
        </kbd>
      </Button>
      <CommandDialog open={isSearching} onOpenChange={setIsSearching}>
        <Command className="bg-background/80 backdrop-blur-2xl">
          <CommandInput
            value={searchQuery}
            onValueChange={(value: string) => {
              setSearchQuery(value);
              setIsSearching(true);
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Search for a sound..."
          />
          <CommandList>
            {searchQuery.trim() ? (
              <CommandGroup>
                <CommandItem onSelect={handleSearch}>
                  <Search className="size-4" />
                  <span>Search for &ldquo;{searchQuery}&rdquo;</span>
                </CommandItem>
              </CommandGroup>
            ) : (
              <RecentSearches />
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
