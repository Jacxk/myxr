import { notFound } from "next/navigation";
import { cache } from "react";
import AdDisplay from "~/components/ad/ad-display";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getServerSession } from "~/lib/auth";
import { api } from "~/trpc/server";
import { FollowButton } from "./follow-button";

const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "bg-red-500 text-white";
    case "pro":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getUser = cache(async (id: string) => {
  const user = await api.user.getUser({ id });
  if (!user) return notFound();

  return user;
});

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  const user = await getUser(id);

  return {
    title: `${user.name} - User`,
    description: `View ${user.name}'s profile on Myxr`,
    authors: [{ name: user.name }],
  };
}

export default async function UserPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  const user = await getUser(id);
  const sounds = await api.user.getSounds(id);

  if (sounds.length === 0) return notFound();

  const session = await getServerSession();
  const createdBy = sounds[0]?.createdBy;
  const followerCount = user._count.followers;

  return (
    <div className="flex w-full flex-col gap-20">
      <div className="flex flex-row gap-10">
        <div>
          <div className="relative">
            <Avatar className="size-24 shrink-0 rounded-full">
              <AvatarImage
                src={createdBy?.image + "?size=96"}
                alt={createdBy?.name ?? ""}
                useNextImage
              />
              <AvatarFallback delayMs={500}>
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {user.role !== "user" && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform">
                <div
                  className={`rounded-full ${getRoleColor(user.role)} border-background border-2 px-3 py-1 text-xs font-medium`}
                >
                  <span>{user.role.toUpperCase()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full flex-col justify-between gap-4 sm:flex-row">
          <div className="flex w-full flex-col gap-2">
            <h1 className="flex gap-4 text-4xl font-bold">
              <span>{user.name}</span>
            </h1>
            <div className="flex gap-6">
              <div className="flex gap-1">
                <span className="font-bold">
                  {followerCount.toLocaleString()}
                </span>
                <span className="text-muted-foreground">followers</span>
              </div>
              <div className="flex gap-1">
                <span className="font-bold">
                  {sounds.length.toLocaleString()}
                </span>
                <span className="text-muted-foreground">sounds</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {session?.user.id !== id && (
              <FollowButton id={id} isFollowing={user.isFollowing} />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Sounds</h2>
        <AdDisplay
          adSlot="1970362642"
          format="fluid"
          layoutKey="-f9+4w+7x-eg+3a"
          showProbability={1}
        />
        <SoundsGrid>
          {sounds.map((sound) => (
            <Sound key={sound.id} sound={sound} />
          ))}
        </SoundsGrid>
      </div>
    </div>
  );
}
