"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { Switch } from "~/components/ui/switch";

export function ThemeSwitch() {
  const { setTheme, resolvedTheme: theme } = useTheme();

  const toggleTheme = useCallback(() => {
    const isDark = theme === "dark";
    setTheme(!isDark ? "dark" : "light");
  }, [theme, setTheme]);

  return (
    <DropdownMenuItem className="flex justify-between" onClick={toggleTheme}>
      <span>Dark Mode</span>
      <Switch checked={theme === "dark"} />
    </DropdownMenuItem>
  );
}
