"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Step } from "~/components/step";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { StepsProvider, useSteps } from "~/context/StepsContext";
import { api } from "~/trpc/react";

function generateBotInvite(guildId: string) {
  return `https://discord.com/oauth2/authorize?client_id=1293222273473318952&guild_id=${guildId}&disable_guild_select=true`;
}

function Step1({ guildId }) {
  const { nextStep, reset } = useSteps();

  function openInviteLink() {
    console.log("running invite");
    const inviteLink = generateBotInvite(guildId);
    window.open(inviteLink, "_blank", "noopener,noreferrer");
    nextStep();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>We found a problem</DialogTitle>
        <DialogDescription>
          Looks like the bot is not in this guild. You need to invite it to the
          guild to continue.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary" onClick={reset}>
            Close
          </Button>
        </DialogClose>
        <Button onClick={openInviteLink}>Invite</Button>
      </DialogFooter>
    </>
  );
}

function Step2({ setOpen, guildId }) {
  const { prevStep, reset } = useSteps();
  const [fetchData, setFetchData] = useState<boolean>(false);
  const { data, isLoading } = api.guild.isBotIn.useQuery(guildId, {
    enabled: fetchData,
  });

  function confirmJoin() {
    setFetchData(true);
  }

  useEffect(() => {
    if (!fetchData) return;
    if (isLoading) {
      toast.loading("Loading, please wait...", { id: "checking-for-bot" });
      return;
    }

    toast.dismiss("checking-for-bot");

    if (data?.value) {
      toast("Bot joined the guild.");
      setOpen(false);
      reset();
    } else {
      toast.error("Looks like the bot did not join.");
      prevStep();
    }
  }, [isLoading, data, fetchData]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Bot has been invited</DialogTitle>
        <DialogDescription>
          Now we need to check if the bot joined the guild. Do wish to continue?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={confirmJoin}>Continue</Button>
      </DialogFooter>
    </>
  );
}

export function InviteBotDialog({ open, setOpen, guildId }) {
  const { data, isLoading } = api.guild.isBotIn.useQuery(guildId, {
    enabled: open,
  });

  if (isLoading || data?.value) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <StepsProvider>
          <Step>
            <Step1 guildId={guildId} />
          </Step>
          <Step>
            <Step2 setOpen={setOpen} guildId={guildId} />
          </Step>
        </StepsProvider>
      </DialogContent>
    </Dialog>
  );
}
