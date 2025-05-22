"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Children,
  type ReactNode,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useState,
} from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface FilterContextType {
  selectedValue: string;
  onSelect: (value: string) => void;
}

interface FilterProps {
  children: ReactNode;
  defaultValue?: string;
  className?: string;
  filterOnUrl?: boolean;
  onChange?: (value: string) => void;
}

interface FilterItemProps {
  children: ReactNode;
  value: string;
  asChild?: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function Filter({
  children,
  defaultValue = "",
  className,
  filterOnUrl,
  onChange,
}: FilterProps) {
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const searchParams = useSearchParams();
  const router = useRouter();

  const availableValues = Children.toArray(children)
    .filter((child): child is React.ReactElement<FilterItemProps> => {
      if (!isValidElement(child)) return false;
      const props = child.props as FilterItemProps;
      return typeof props.value === "string";
    })
    .map((child) => child.props.value);

  const handleSelect = (value: string) => {
    onChange?.(value);
    if (filterOnUrl) setSearchParams(value);
    else setSelectedValue(value);
  };

  const setSearchParams = (value: string) => {
    router.replace(`?filter=${value}`);
  };

  useEffect(() => {
    if (!filterOnUrl) return;

    const filter = searchParams.get("filter");

    if (filter) {
      setSelectedValue(filter);
    }
  }, [filterOnUrl, searchParams]);

  useEffect(() => {
    if (searchParams.get("filter")) return;

    setSearchParams(defaultValue);
  }, []);

  return (
    <FilterContext.Provider value={{ selectedValue, onSelect: handleSelect }}>
      <div className={cn("flex gap-2", className)}>{children}</div>
    </FilterContext.Provider>
  );
}

export function FilterItem({
  children,
  value,
  asChild = false,
}: FilterItemProps) {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error("FilterItem must be used within a Filter component");
  }

  const { selectedValue, onSelect } = context;
  const isActive = selectedValue === value;

  return (
    <Button
      onClick={() => onSelect(value)}
      size="sm"
      variant={isActive ? "default" : "ghost"}
      asChild={asChild}
    >
      {children}
    </Button>
  );
}
