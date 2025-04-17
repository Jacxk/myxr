import { notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { SoundPage } from "./_components/sound-page";

export default async function ({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const sound = await api.sound.getSound({ id });

  let user;
  if (!session)
    user = {
      id: "none",
      name: "Guest",
    };
  else user = session.user;

  if (!sound) return notFound();

  return (
    <>
      <title>{`${sound.name} - Sound`}</title>
      <SoundPage
        sound={sound}
        id={id}
        user={{
          id: user.id,
          image: user.image,
          name: user.name,
        }}
      />
    </>
  );
}
