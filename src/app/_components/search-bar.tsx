"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useSearch } from "~/context/SearchContext";
import { cn } from "~/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  className?: string;
};

function SearchInput({
  value,
  autoFocus,
  className,
  onChange,
  onBlur,
}: Readonly<SearchInputProps>) {
  return (
    <Input
      className={cn("border-r-none rounded-r-none", className)}
      type="search"
      placeholder="Search for a sound"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      autoFocus={autoFocus}
    />
  );
}

export function MobileSearch() {
  const { searchQuery, isMobileSearchOpen, setSearchQuery, closeMobileSearch } =
    useSearch();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/sound?query=${encodeURIComponent(searchQuery.trim())}`);
      closeMobileSearch();
    }
  };

  const handleBlur = () => {
    closeMobileSearch();
  };

  if (!isMobileSearchOpen) return null;

  return (
    <div className="bg-background/50 fixed inset-0 z-50 backdrop-blur-2xl">
      <div className="p-6">
        <form onSubmit={handleSearch} className="flex">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={handleBlur}
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
      </div>
    </div>
  );
}

export function SearchBar() {
  const { searchQuery, setSearchQuery, openMobileSearch } = useSearch();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/sound?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex justify-end">
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
    </div>
  );
}
