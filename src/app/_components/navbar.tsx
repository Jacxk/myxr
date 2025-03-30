import { Upload } from "lucide-react";
import { type Session } from "next-auth";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { auth } from "~/server/auth";
import { AccountMenu } from "./account-menu";
import { Authenticated, NotAuthenticated } from "./authentication";
import { SearchBar } from "./search-bar";
import { SelectGuild } from "./select-guild";

export default async function Navbar() {
  const session: Session | null = await auth();

  return (
    <nav className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-2 border-b p-6">
      <Link href="/" className="text-4xl font-bold">
        Myxr
      </Link>
      <SearchBar />
      <Authenticated>
        <div className="flex items-center gap-4">
          <SelectGuild guilds={session?.user.guilds} />
        </div>
        <Link href="/upload">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Upload />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload a Sound</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Link>
        <AccountMenu user={session?.user} />
      </Authenticated>
      <NotAuthenticated>
        <Link href="/api/auth/signin">
          <Button>Sign in</Button>
        </Link>
      </NotAuthenticated>
    </nav>
  );
}
