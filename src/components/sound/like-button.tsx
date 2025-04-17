"use client";

import { Heart, HeartOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  const [isLiked, setIsLiked] = useState<boolean>(liked ?? false);
  const { mutate, isPending, isSuccess, data } =
    api.sound.likeSound.useMutation();

  const likeClick = () => {
    if (isPreview) {
      toast(`Preview Mode: Sound like ${isLiked ? "removed" : "added"}`);
      setIsLiked((liked) => !liked)
      return;
    }
    mutate({ soundId, liked: !liked });
  };

  useEffect(() => {
    if (!data?.success) return;

    toast(data.value ? "Sound liked" : "Liked removed");
    setIsLiked(data.value);
  }, [isSuccess, data]);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={isPending}
            onClick={likeClick}
          >
            {isLiked ? <HeartOff /> : <Heart />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isLiked ? "UnLike" : "Like"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
