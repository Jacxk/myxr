import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "~/lib/auth";

export const metadata: Metadata = {
  title: "My Guilds",
};

export default async function MeGuildsPage() {
  const session = await getServerSession();
  const guild = session?.user.guilds[0];

  if (!guild)
    return (
      <span>
        There was an error while trying to get your guilds. Try to sign in
        again!
      </span>
    );

  redirect(`/user/me/guilds/${guild.id}`);
}
