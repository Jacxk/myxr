"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import { ErrorToast } from "~/lib/messages/toast.global";
import { api } from "~/trpc/react";

export function FollowButton({
  id,
  isFollowing,
}: Readonly<{ id: string; isFollowing: boolean }>) {
  const [following, setFollowing] = useState(isFollowing);
  const { mutateAsync, isPending } = api.user.followUser.useMutation();
  const router = useRouter();

  const onFollowButtonClick = useCallback(() => {
    if (isPending) return;
    setFollowing((following) => !following);
    mutateAsync({ id })
      .then((data) => {
        setFollowing(data.value.following);
        router.refresh();
      })
      .catch((error) => {
        console.error(error);
        ErrorToast.internal()
      });
  }, [isPending, id, router, mutateAsync]);

  return (
    <Button
      variant={following ? "default" : "outline"}
      className="flex w-32 rounded-full"
      onClick={onFollowButtonClick}
    >
      <Heart fill={following ? "black" : undefined} />
      {following ? "Following" : "Follow"}
    </Button>
  );
}
