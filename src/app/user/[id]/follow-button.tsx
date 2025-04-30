"use client";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import { ErrorToast } from "~/lib/messages/toast.global";
import { useTRPC } from "~/trpc/react";

import { useMutation } from "@tanstack/react-query";

export function FollowButton({
  id,
  isFollowing,
}: Readonly<{ id: string; isFollowing: boolean }>) {
  const api = useTRPC();
  const router = useRouter();
  const [following, setFollowing] = useState(isFollowing);
  const { mutateAsync, isPending } = useMutation(
    api.user.followUser.mutationOptions(),
  );

  const onFollowButtonClick = useCallback(() => {
    if (isPending) return;
    setFollowing((following) => !following);
    // TODO: Move to useMutation
    mutateAsync({ id })
      .then((data) => {
        setFollowing(data.value.following);
        router.refresh();
      })
      .catch((error) => {
        console.error(error);
        ErrorToast.internal();
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
