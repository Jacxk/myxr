import { Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Authenticated } from "./authentication";
import { AccountMenu } from "./navbar/account-menu";
import { Notifications } from "./navbar/notifications";
import { SearchBar } from "./navbar/search-bar";
import { SelectGuild } from "./navbar/select-guild";

export default async function Navbar() {
  return (
    <nav className="relative mx-auto flex w-full max-w-7xl grow-0 items-center justify-between gap-2 border-b p-6">
      <Link href="/" className="text-4xl font-bold">
        myxr
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
      </Authenticated>
      <Notifications />
      <AccountMenu />
    </nav>
  );
}
