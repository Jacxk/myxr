"use client";

import type { User } from "better-auth";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Switch } from "~/components/ui/switch";
import { signOut } from "~/lib/auth-client";

export function AccountMenu({ user }: Readonly<{ user: User | undefined }>) {
  const { setTheme, theme } = useTheme();

  const toggleTheme = useCallback(() => {
    const isDark = theme === "dark";
    setTheme(!isDark ? "dark" : "light");
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex cursor-pointer items-center gap-2"
        asChild
      >
        <Avatar>
          <AvatarImage src={user?.image + "?size=40"} alt={user?.name} />
          <AvatarFallback delayMs={500}>{user?.name}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuLabel className="flex justify-between">
          <span className="text-muted-foreground">Hello</span>
          <span>{user?.name}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={"/user/me"}>
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
        <DropdownMenuItem onClick={() => signOut()}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
