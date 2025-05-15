"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

interface SearchContextType<T> {
  searchQuery: string;
  isSearching: boolean;
  searchResults: T[];
  isMobileSearchOpen: boolean;
  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSearchResults: (results: T[]) => void;
  openMobileSearch: () => void;
  closeMobileSearch: () => void;
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

  const openMobileSearch = () => setIsMobileSearchOpen(true);
  const closeMobileSearch = () => setIsMobileSearchOpen(false);

  const value = {
    searchQuery,
    isSearching,
    searchResults,
    isMobileSearchOpen,
    setSearchQuery,
    setIsSearching,
    setSearchResults,
    openMobileSearch,
    closeMobileSearch,
  };

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
