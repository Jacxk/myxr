import { Session } from "next-auth";
import Link from "next/link";
import { UploadIcon } from "~/components/icons/upload";
import { Button } from "~/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "~/components/ui/menubar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { auth } from "~/server/auth";
import { Authenticated, NotAuthenticated } from "./authentication";

export default async function Navbar() {
  const session: Session | null = await auth();

  const user = session?.user;
  const guilds = user?.guilds.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <nav className="flex items-center justify-between gap-4 p-4 shadow-md px-8">
      <Link href="/" className="text-4xl font-bold">
        Mxng
      </Link>
      <div>
        <Authenticated>
          <div className="flex items-center gap-2">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a Guild" />
              </SelectTrigger>
              <SelectContent>
                {guilds?.map((guild) => (
                  <SelectItem key={guild.id} value={guild.id}>
                    {guild.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Menubar className="py-6 shadow-none">
              <MenubarMenu>
                <MenubarTrigger className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span>{user?.name}</span>
                    <img
                      src={user?.image ?? ""}
                      alt={user?.name ?? "User image"}
                      className="h-8 w-8 rounded-full"
                    />
                  </div>
                </MenubarTrigger>
                <MenubarContent>
                  <Link href="/upload">
                    <MenubarItem className="cursor-pointer">
                      Upload Sound
                    </MenubarItem>
                  </Link>
                  <Link href={`/users/${user?.id}`}>
                    <MenubarItem className="cursor-pointer">
                      Profile
                    </MenubarItem>
                  </Link>
                  <MenubarSeparator />
                  <Link href="/settings">
                    <MenubarItem className="cursor-pointer">
                      Settings
                    </MenubarItem>
                  </Link>
                  <MenubarSeparator />
                  <Link href="/api/signout">
                    <MenubarItem className="cursor-pointer">
                      Sign out
                    </MenubarItem>
                  </Link>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </Authenticated>
        <NotAuthenticated>
          <Link href="/api/auth/signin">
            <Button>Sign in</Button>
          </Link>
        </NotAuthenticated>
      </div>
    </nav>
  );
}
