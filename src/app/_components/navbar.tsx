import { type Session } from "next-auth";
import Link from "next/link";
import { UploadIcon } from "~/components/icons/upload";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { AccountMenu } from "./account-menu";
import { Authenticated, NotAuthenticated } from "./authentication";
import { SelectGuild } from "./select-guild";

export default async function Navbar() {
  const session: Session | null = await auth();

  return (
    <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 border-b p-6 shadow-md">
      <Link href="/" className="text-4xl font-bold">
        Myxr
      </Link>
      <div>
        <Authenticated>
          <div className="flex items-center gap-4">
            <SelectGuild guilds={session?.user.guilds} />
            <Link href="/upload">
              <Button variant="outline">
                <UploadIcon /> Upload
              </Button>
            </Link>
            <AccountMenu user={session?.user} />
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
