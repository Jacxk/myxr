"use client";

import { useMutation } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
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
  const router = useRouter();
  const posthog = usePostHog();

  const [isLiked, setIsLiked] = useState<boolean>(liked ?? false);

  const { mutate, isPending } = useMutation(
    api.sound.likeSound.mutationOptions({
      onSuccess(data, variables) {
        posthog.capture("User like sound", {
          soundId: variables.soundId,
          liked: variables.liked,
        });

        if (!data.success) return;

        setIsLiked(data.value);
        router.refresh();
      },
      onError() {
        setIsLiked(false);
        ErrorToast.internal();
      },
    }),
  );

  const likeClick = () => {
    if (!session) {
      ErrorToast.login();
      return;
    }

    const liked = !isLiked;
    setIsLiked(liked);

    if (isPreview) {
      toast(`Preview Mode: Sound like ${isLiked ? "removed" : "added"}`);
      return;
    }

    if (!isPending) mutate({ soundId, liked });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <Button
            size={typeof likes === "number" ? "default" : "icon"}
            variant="outline"
            onClick={likeClick}
          >
            <Heart fill={isLiked ? "currentColor" : "none"} />

            {likes &&
              Intl.NumberFormat(navigator.language, {
                notation: "compact",
              }).format(likes)}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isLiked ? "Remove like" : "Like"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
