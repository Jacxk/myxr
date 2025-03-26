"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/sound?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-1/4">
      <Input
        className="border-r-none rounded-r-none"
        type="search"
        placeholder="Search for a sound"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button
        className="border-l-none rounded-l-none px-6"
        size="icon"
        variant="outline"
        type="submit"
      >
        <Search />
      </Button>
    </form>
  );
}
