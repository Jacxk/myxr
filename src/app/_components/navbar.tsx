import { Session } from "next-auth";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { auth } from "~/server/auth";
import { AccountMenu } from "./account-menu";
import { Authenticated, NotAuthenticated } from "./authentication";
import { UploadIcon } from "~/components/icons/upload";

export default async function Navbar() {
  const session: Session | null = await auth();

  const user = session?.user;
  const guilds = user?.guilds.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 border-b p-6 shadow-md">
      <Link href="/" className="text-4xl font-bold">
        Mxng
      </Link>
      <div>
        <Authenticated>
          <div className="flex items-center gap-4">
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
            <Link href="/upload">
              <Button variant="outline">
                <UploadIcon /> Upload
              </Button>
            </Link>
            <AccountMenu user={user} />
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
