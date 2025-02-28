"use client";

import { User } from "next-auth";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Switch } from "~/components/ui/switch";

export function AccountMenu({ user }: Readonly<{ user: User | undefined }>) {
  const { setTheme, theme } = useTheme();

  const toggleTheme = useCallback(() => {
    const isDark = theme === "dark";
    setTheme(!isDark ? "dark" : "light");
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2">
        <span>{user?.name}</span>
        <img
          src={user?.image ?? ""}
          alt={user?.name ?? "User image"}
          className="h-8 w-8 rounded-full"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <Link href="/upload">
          <DropdownMenuItem>Upload Sound</DropdownMenuItem>
        </Link>
        <Link href={`/users/${user?.id}`}>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex justify-between"
          onClick={toggleTheme}
        >
          <span>Dark Mode</span>
          <Switch checked={theme === "dark"} />
        </DropdownMenuItem>
        <Link href="/settings">
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href="/api/auth/signout">
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
