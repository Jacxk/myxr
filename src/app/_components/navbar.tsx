import { Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { SearchProvider } from "~/context/SearchContext";
import { AccountMenu } from "./account-menu";
import { AuthenticatedClient } from "./authentication-client";
import { MobileSearch, SearchBar } from "./search-bar";
import { SelectGuild } from "./select-guild";

function NavbarContent() {
  return (
    <>
      <header className="sticky top-0 right-0 left-0 z-10 flex w-full grow-0 items-center justify-between backdrop-blur-2xl">
        <nav className="relative mx-auto flex w-full max-w-7xl grow-0 items-center justify-between gap-2 border-b p-6">
          <Link href="/" className="text-4xl font-bold">
            myxr
          </Link>
          <div className="flex flex-1 items-center justify-end gap-2">
            <SearchBar />
            <AuthenticatedClient>
              <div className="flex items-center gap-4">
                <SelectGuild />
              </div>
              <Link href="/upload">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-background/30"
                      >
                        <Upload />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Upload a Sound</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>
            </AuthenticatedClient>
            <AccountMenu />
          </div>
        </nav>
      </header>
      <MobileSearch />
    </>
  );
}

export default function Navbar() {
  return (
    <SearchProvider>
      <NavbarContent />
    </SearchProvider>
  );
}
