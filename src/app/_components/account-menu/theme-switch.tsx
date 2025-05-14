"use client";

import { useTheme } from "next-themes";
import { usePostHog } from "posthog-js/react";
import { useCallback, useEffect } from "react";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { Switch } from "~/components/ui/switch";

export function ThemeSwitch() {
  const { setTheme, resolvedTheme: theme } = useTheme();
  const posthog = usePostHog();

  const toggleTheme = useCallback(() => {
    const isDark = theme === "dark";
    setTheme(!isDark ? "dark" : "light");
  }, [theme, setTheme]);

  useEffect(() => {
    posthog.capture("Theme Used", {
      theme,
    });
  }, [theme]);

  return (
    <DropdownMenuItem className="flex justify-between" onClick={toggleTheme}>
      <span>Dark Mode</span>
      <Switch checked={theme === "dark"} />
    </DropdownMenuItem>
  );
}
