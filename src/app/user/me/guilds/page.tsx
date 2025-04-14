import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function () {
  const session = await auth();
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
