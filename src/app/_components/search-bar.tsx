"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

type SearchInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  className?: string;
};

function SearchInput({
  value,
  onChange,
  autoFocus,
  onBlur,
  className,
}: Readonly<SearchInputProps>) {
  return (
    <Input
      className={`border-r-none rounded-r-none ${className}`}
      type="search"
      placeholder="Search for a sound"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      autoFocus={autoFocus}
    />
  );
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/sound?q=${encodeURIComponent(query.trim())}`);
      setIsSearchVisible(false);
    }
  };

  const handleBlur = () => {
    setIsSearchVisible(false);
  };

  const props: SearchInputProps = {
    value: query,
    onChange: (e) => setQuery(e.target.value),
  };

  const className = isSearchVisible
    ? "absolute left-0 right-0 top-0 z-10 bg-background p-6"
    : "flex flex-1 justify-end";

  return (
    <div className={`${className}`}>
      {!isSearchVisible && (
        <Button
          className="sm:hidden"
          size="icon"
          variant="outline"
          onClick={() => setIsSearchVisible(true)}
        >
          <Search />
        </Button>
      )}

      <form
        onSubmit={handleSearch}
        className={`sm:static ${isSearchVisible ? "flex" : "hidden"} sm:flex`}
      >
        {isSearchVisible && (
          <SearchInput {...props} onBlur={handleBlur} autoFocus />
        )}
        <SearchInput className="hidden sm:block" {...props} />
        <Button
          className="border-l-none rounded-l-none px-6"
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
