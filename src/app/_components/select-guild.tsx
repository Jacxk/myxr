"use client";

import type { Guild } from "next-auth";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { StepsProvider, useSteps } from "~/context/StepsContext";
import { api } from "~/trpc/react";

type InviteButtonProps = {
  guildId: string;
  onClick?: () => void;
  tries: number;
};

type StepComponentProps = {
  step: number;
  title: string;
  description: string;
  children?: ReactNode;
  footer?: ReactNode;
};

type GuildState = {
  id?: string;
  name?: string;
};

function generateBotInvite(guildId: string) {
  return `https://discord.com/oauth2/authorize?client_id=1293222273473318952&guild_id=${guildId}&disable_guild_select=true`;
}

function openInviteLink(guildId: string) {
  const inviteLink = generateBotInvite(guildId);
  window.open(inviteLink, "_blank", "noopener,noreferrer");
}

function InviteButton({
  onClick,
  tries,
  guildId,
}: Readonly<InviteButtonProps>) {
  const { currentStep, setCurrentStep } = useSteps();
  const [inviteClicked, setInviteClicked] = useState(false);
  const [maxTries, setMaxTries] = useState(4);

  const handleClick = useCallback(() => {
    openInviteLink(guildId);
    onClick?.();

    if (currentStep === 1) {
      setCurrentStep(2);
      setInviteClicked(true);
    }
  }, [currentStep, guildId]);

  useEffect(() => {
    if (!inviteClicked) {
      setMaxTries((prev) => prev + 1);
      return;
    }

    if (tries >= maxTries) {
      setCurrentStep(4);
      return;
    }

    if (tries > 0 && inviteClicked) {
      setCurrentStep(3);
    }
  }, [tries, inviteClicked]);

  return <Button onClick={() => handleClick()}>Invite</Button>;
}

function StepComponent({
  title,
  description,
  children,
  step,
}: Readonly<StepComponentProps>) {
  const { currentStep } = useSteps();
  if (step !== currentStep) return null;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {children}
    </>
  );
}

export function SelectGuild({
  guilds,
}: Readonly<{ guilds: Guild[] | undefined }>) {
  const [guild, setGuild] = useState<GuildState>(
    JSON.parse(localStorage.getItem("selectedGuild") ?? "{}"),
  );
  const [prevGuild, setPrevGuild] = useState<GuildState>({});
  const [botJoined, setBotJoined] = useState<boolean>(false);
  const [tries, setTries] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const computedValue = useMemo(
    () => guild.id && `${guild.id}-${guild.name}`,
    [guild],
  );

  const { mutateAsync, isPending, data } = api.guild.isBotIn.useMutation();

  const fallbackGuild = useCallback(() => {
    setGuild(prevGuild);
  }, [prevGuild]);

  const selectGuild = useCallback(
    async (guildString: string) => {
      const [id, name] = guildString.split("-");

      setBotJoined(false);
      setGuild({ id, name });
      setPrevGuild(guild);

      const { success, value } = await mutateAsync(id!);

      if (!isPending && success && !value) {
        setOpen(true);
        return;
      } else if (!success) {
        toast.error("Something went wrong...");
        fallbackGuild();
        return;
      }

      localStorage.setItem("selectedGuild", JSON.stringify({ id, name }));
    },
    [isPending, guild],
  );

  const checkBotJoined = useCallback(() => {
    mutateAsync(guild.id!).then(({ success, value }) => {
      setBotJoined(success && value);
      setTries((tries) => tries + 1);
    });
  }, [guild.id]);

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !botJoined) fallbackGuild();
      setOpen(open);
    },
    [botJoined, fallbackGuild],
  );

  useEffect(() => {
    if (isPending || !data) return;

    if (botJoined && data.success && data.value) {
      setOpen(false);
      toast("Bot has been successfully detected!");
    }
  }, [data, isPending, botJoined]);

  useEffect(() => {
    const removeListener = () => {
      window.removeEventListener("focus", checkBotJoined);
    };

    if (open) window.addEventListener("focus", checkBotJoined);
    else removeListener();

    return removeListener;
  }, [open, guild.id, data]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <StepsProvider>
            <StepComponent
              step={1}
              title="We found a problem"
              description={`Looks like the bot is not in ${guild.name}. You need to invite it to the guild to continue.`}
            />
            <StepComponent
              step={2}
              title="Invite link generated"
              description="We've opened a new tab with the invite link. If it didn't open try clicking the button again."
            />
            <StepComponent
              step={3}
              title="Oh no..."
              description="We couldn't detect the bot inside the guild. Try inviting it again."
            />
            <StepComponent
              step={4}
              title="This is awkward."
              description={`We've tried ${tries} times to verify if the bot joined. Maybe try again later.`}
            />
            <DialogFooter>
              <Button onClick={checkBotJoined} variant="outline">
                Re-Check
              </Button>
              <InviteButton guildId={guild.id!} tries={tries} />
            </DialogFooter>
          </StepsProvider>
        </DialogContent>
      </Dialog>
      <Select onValueChange={selectGuild} value={computedValue}>
        <SelectTrigger className="sm:min-w-[180px]" asChild>
          <div className="hidden sm:flex">
            <SelectValue placeholder="Select a Guild" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {guilds?.map((guild) => (
            <SelectItem key={guild.id} value={`${guild.id}-${guild.name}`}>
              {guild.name}
            </SelectItem>
          )) ?? (
            <SelectItem value="none" disabled>
              No guilds found
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </>
  );
}
