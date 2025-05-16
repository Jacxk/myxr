"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface SearchContextType<T> {
  searchQuery: string;
  isSearching: boolean;
  searchResults: T[];
  isMobileSearchOpen: boolean;
  recentSearches: string[];
  search: (query?: string) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSearchResults: (results: T[]) => void;
  openMobileSearch: () => void;
  closeMobileSearch: () => void;
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SearchContext = createContext<SearchContextType<any> | undefined>(
  undefined,
);

export function SearchProvider<T>({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const router = useRouter();

  const openMobileSearch = () => setIsMobileSearchOpen(true);
  const closeMobileSearch = () => setIsMobileSearchOpen(false);

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q !== query);
      const updated = [query, ...filtered];
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentSearch = (query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((q) => q !== query);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const search = (query?: string) => {
    query ??= searchQuery;
    if (query.trim().length === 0) return;

    closeMobileSearch();
    setIsSearching(false);
    addRecentSearch(query);
    router.push(`/sound?query=${encodeURIComponent(query.trim())}`);
  };

  const value = {
    searchQuery,
    isSearching,
    searchResults,
    isMobileSearchOpen,
    recentSearches,
    search,
    setSearchQuery,
    setIsSearching,
    setSearchResults,
    openMobileSearch,
    closeMobileSearch,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved) as string[]);
    }
  }, []);

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch<T>(): SearchContextType<T> {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context as SearchContextType<T>;
}
