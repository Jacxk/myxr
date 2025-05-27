"use client";

import { useMutation } from "@tanstack/react-query";
import { Share } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { env } from "~/env";
import { useTRPC } from "~/trpc/react";

export function ShareButton({
  soundId,
  soundName,
  shares,
}: {
  soundId: string;
  soundName: string;
  shares: number;
}) {
  const posthog = usePostHog();
  const router = useRouter();
  const api = useTRPC();

  const { mutate } = useMutation(
    api.sound.share.mutationOptions({
      onSettled() {
        router.refresh();
      },
    }),
  );
  const onShareClick = async () => {
    try {
      await navigator.share({
        url: `${env.NEXT_PUBLIC_BASE_URL}/sounds/${soundId}`,
        text: `Check out this sound: ${soundName}`,
      });

      mutate({ soundId });
      posthog.capture("Sound shared", {
        soundId,
      });
    } catch {}
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <Button variant="outline" onClick={() => onShareClick()}>
            <Share />

            {shares &&
              Intl.NumberFormat(navigator.language, {
                notation: "compact",
              }).format(shares)}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
