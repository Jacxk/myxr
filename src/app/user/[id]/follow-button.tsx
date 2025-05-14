"use client";

import { useMutation } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import { useSession } from "~/lib/auth-client";
import { ErrorToast } from "~/lib/messages/toast.global";
import { useTRPC } from "~/trpc/react";

export function FollowButton({
  id,
  isFollowing,
}: Readonly<{ id: string; isFollowing: boolean }>) {
  const api = useTRPC();
  const router = useRouter();
  const { data: session } = useSession();

  const [following, setFollowing] = useState(isFollowing);

  const { mutate, isPending } = useMutation(
    api.user.followUser.mutationOptions({
      onSuccess({ value }) {
        setFollowing(value.following);
      },
      onError() {
        setFollowing(false);
      },
      onSettled() {
        router.refresh();
      },
    }),
  );

  const onFollowButtonClick = useCallback(() => {
    if (isPending) return;
    if (!session) {
      ErrorToast.login();
      return;
    }
    setFollowing((following) => !following);
    mutate({ id });
  }, [id, isPending, session, mutate]);

  return (
    <Button
      variant={following ? "default" : "outline"}
      className="flex w-32 rounded-full"
      onClick={onFollowButtonClick}
    >
      <Heart fill={following ? "currentColor" : "none"} />
      {following ? "Following" : "Follow"}
    </Button>
  );
}
