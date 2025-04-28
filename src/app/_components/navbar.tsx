import { Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { AccountMenu } from "./account-menu";
import { Authenticated, NotAuthenticated } from "./authentication";
import { SearchBar } from "./search-bar";
import { SelectGuild } from "./select-guild";
import { SignInButton } from "./signin";

export default async function Navbar() {
  return (
    <nav className="relative mx-auto flex w-full max-w-7xl grow-0 items-center justify-between gap-2 border-b p-6">
      <Link href="/" className="text-4xl font-bold">
        Myxr
      </Link>
      <SearchBar />
      <Authenticated>
        <div className="flex items-center gap-4">
          <SelectGuild />
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
        <AccountMenu />
      </Authenticated>

      <NotAuthenticated>
        <SignInButton />
      </NotAuthenticated>
    </nav>
  );
}
