"use client";

import { Heart, HeartOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "~/lib/auth-client";
import { ErrorToast } from "~/lib/messages/toast.global";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function LikeButton({
  soundId,
  liked,
  isPreview,
}: Readonly<{
  soundId: string;
  liked?: boolean;
  isPreview?: boolean;
}>) {
  const { data: session } = useSession();

  const [isLiked, setIsLiked] = useState<boolean>(liked ?? false);
  const { mutate, isPending } = api.sound.likeSound.useMutation({
    onSuccess(data) {
      if (!data.success) return;

      toast(data.value ? "Sound liked" : "Liked removed");
      setIsLiked(data.value);
    },
    onError(error) {
      if (error.data?.code === "UNAUTHORIZED") {
        ErrorToast.login();
      }
      setIsLiked(false)
    },
  });

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
          <Button variant="outline" size="icon" onClick={likeClick}>
            {isLiked ? <HeartOff /> : <Heart />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isLiked ? "UnLike" : "Like"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
