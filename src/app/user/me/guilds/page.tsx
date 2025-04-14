import { auth } from "~/server/auth";
import GuildsRoute from "./[id]/page";

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

  return <GuildsRoute params={Promise.resolve({ id: guild.id })} />;
}
