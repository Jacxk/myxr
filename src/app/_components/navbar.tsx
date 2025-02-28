import Link from "next/link";
import { UploadIcon } from "~/components/icons/upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { auth } from "~/server/auth";
import { Authenticated, NotAuthenticated } from "./authentication";
import { Session } from "next-auth";

export default async function Navbar() {
  const session: Session | null = await auth();

  const user = session?.user;
  const guilds = user?.guilds.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <nav className="flex items-center justify-between gap-4 p-4 shadow-md">
      <span className="text-lg font-bold">Mxng</span>
      <div>
        <Authenticated>
          <div className="flex items-center gap-2">
            <Link href="/upload">
              <UploadIcon />
            </Link>
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
            <div className="flex items-center gap-2">
              <img
                src={user?.image ?? ""}
                alt={user?.name ?? "User image"}
                className="h-8 w-8 rounded-full"
              />
              <span>{user?.name}</span>
            </div>
          </div>
        </Authenticated>
        <NotAuthenticated>
          <Link href="/api/auth/signin">Sign in</Link>
        </NotAuthenticated>
      </div>
    </nav>
  );
}
