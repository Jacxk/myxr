"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export function FollowButton({
  id,
  isFollowing,
}: Readonly<{ id: string; isFollowing: boolean }>) {
  const [following, setFollowing] = useState(isFollowing);
  const { mutate, isPending, data, error } = api.user.followUser.useMutation();
  const router = useRouter();

  const onFollowButtonClick = useCallback(() => {
    if (isPending) return;
    setFollowing((following) => !following);
    mutate({ id });
  }, [isPending]);

  useEffect(() => {
    if (!isPending && error) {
      toast.error(error.message);
      return;
    }

    if (!isPending && data) {
      setFollowing(data.value.following);
      router.refresh();
    }
  }, [isPending, data, error]);

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
