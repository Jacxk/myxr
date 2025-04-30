"use client";

import { useMutation } from "@tanstack/react-query";
import { Heart, HeartOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "~/lib/auth-client";
import { ErrorToast } from "~/lib/messages/toast.global";
import { useTRPC } from "~/trpc/react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function LikeButton({
  soundId,
  likes,
  liked,
  isPreview,
}: Readonly<{
  soundId: string;
  likes?: number;
  liked?: boolean;
  isPreview?: boolean;
}>) {
  const api = useTRPC();
  const { data: session } = useSession();

  const [isLiked, setIsLiked] = useState<boolean>(liked ?? false);
  const { mutate, isPending } = useMutation(
    api.sound.likeSound.mutationOptions({
      onSuccess(data) {
        if (!data.success) return;

        toast(data.value ? "Sound liked" : "Liked removed");
        setIsLiked(data.value);
      },
      onError(error) {
        if (error.data?.code === "UNAUTHORIZED") {
          ErrorToast.login();
        }
        setIsLiked(false);
      },
    }),
  );

  const likeClick = () => {
    if (!session) {
      ErrorToast.login();
      return;
    }

    setIsLiked((liked) => !liked);

    if (isPreview) {
      toast(`Preview Mode: Sound like ${isLiked ? "removed" : "added"}`);
      return;
    }

    if (!isPending) mutate({ soundId, liked: !liked });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <Button variant="outline" onClick={likeClick}>
            {isLiked ? <HeartOff /> : <Heart />}

            {likes &&
              Intl.NumberFormat(navigator.language, {
                notation: "compact",
              }).format(likes)}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isLiked ? "UnLike" : "Like"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
