"use client";

import { ArrowUpLeft, ChevronLeft, History, Search } from "lucide-react";
import { type InputHTMLAttributes, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useSearch } from "~/context/SearchContext";
import { cn } from "~/lib/utils";

function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      className={cn("border-r-none bg-background/30 rounded-r-none", className)}
      type="search"
      placeholder="Search for a sound"
      {...props}
    />
  );
}

function RecentSearches() {
  const { recentSearches, search, setSearchQuery } = useSearch();

  return (
    <div className="max-h-[500px] flex-1 overflow-y-auto rounded-lg">
      {recentSearches.length === 0 && (
        <p className="text-muted-foreground p-4">No recent searches</p>
      )}
      {recentSearches.map((query) => (
        <Button
          key={query}
          variant="ghost"
          size="lg"
          className="hover:bg-muted/50 w-full rounded-none px-2"
          onClick={() => {
            search(query);
            setSearchQuery(query);
          }}
          asChild
        >
          <div className="flex items-center gap-4">
            <History className="ml-3" />
            <span className="grow">{query}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery(query);
              }}
            >
              <ArrowUpLeft />
            </Button>
          </div>
        </Button>
      ))}
    </div>
  );
}

export function MobileSearch() {
  const {
    searchQuery,
    isMobileSearchOpen,
    search,
    setSearchQuery,
    closeMobileSearch,
    setIsSearching,
  } = useSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search();
  };

  useEffect(() => {
    if (!isMobileSearchOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
  }, [isMobileSearchOpen]);

  if (!isMobileSearchOpen) return null;

  return (
    <div className="bg-background/50 fixed inset-0 z-50 backdrop-blur-2xl">
      <div className="p-6">
        <form onSubmit={handleSearch} className="flex">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => {
              closeMobileSearch();
              setIsSearching(false);
            }}
          >
            <ChevronLeft />
          </Button>
          <SearchInput
            value={searchQuery}
            onFocus={() => setIsSearching(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <Button
            className="border-l-none bg-background/30 rounded-l-none px-6"
            size="icon"
            variant="outline"
            type="submit"
          >
            <Search />
          </Button>
        </form>
        <RecentSearches />
      </div>
    </div>
  );
}

export function SearchBar() {
  const {
    searchQuery,
    isSearching,
    search,
    setSearchQuery,
    openMobileSearch,
    setIsSearching,
  } = useSearch();

  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setIsSearching(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsSearching]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search();
  };

  return (
    <div className="relative flex justify-end" ref={searchBarRef}>
      <Button
        className="bg-background/30 sm:hidden"
        size="icon"
        variant="outline"
        onClick={openMobileSearch}
      >
        <Search />
      </Button>

      <form
        onSubmit={handleSearch}
        className="hidden flex-1 justify-end sm:flex"
      >
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearching(true)}
          className="hidden sm:block"
        />
        <Button
          className="border-l-none bg-background/30 rounded-l-none px-6"
          size="icon"
          variant="outline"
          type="submit"
        >
          <Search />
        </Button>
      </form>
      {isSearching && (
        <div className="bg-background/80 absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg backdrop-blur-2xl">
          <RecentSearches />
        </div>
      )}
    </div>
  );
}
