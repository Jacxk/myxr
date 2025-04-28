"use client";

import type { Guild } from "@prisma/client";
import type { Snowflake } from "discord-api-types/globals";
import { type ReactNode, useCallback, useEffect, useState } from "react";
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
import { useSession } from "~/lib/auth-client";
import { ErrorToast } from "~/lib/messages/toast.global";
import { api } from "~/trpc/react";

type InviteButtonProps = {
  guildId: string;
  onClick?: () => void;
};

type StepComponentProps = {
  step: number;
  title: string;
  description: string;
  children?: ReactNode;
  footer?: ReactNode;
  setCurrentStep?: (step: number) => void;
};

type GuildState = {
  id?: Snowflake;
  name?: string;
};

type ExtendableSuccess = {
  onSuccess?: (guild: GuildState, newBot: boolean) => void;
};

type GuildSelectProps = {
  guilds: Guild[];
  selectedGuild: GuildState;
  dialogOpen: boolean;
  isSuccess?: boolean;
  setSelectedGuild: (guild: GuildState) => void;
  onDialogOpenChange: (open: boolean) => void;
} & ExtendableSuccess;

type BotCheckInProps = {
  check?: boolean;
  tries: number;
  guild: GuildState;
  setTries: (tries: number) => void;
} & ExtendableSuccess;

function generateBotInvite(guildId: string) {
  return `https://discord.com/oauth2/authorize?client_id=1293222273473318952&guild_id=${guildId}&disable_guild_select=true`;
}

function openInviteLink(guildId: string) {
  const inviteLink = generateBotInvite(guildId);
  window.open(inviteLink, "_blank", "noopener,noreferrer");
}

function InviteButton({ onClick, guildId }: Readonly<InviteButtonProps>) {
  const { currentStep, setCurrentStep } = useSteps();

  const handleClick = useCallback(() => {
    openInviteLink(guildId);
    onClick?.();

    if (currentStep === 1) {
      setCurrentStep(2);
    }
  }, [currentStep, guildId, onClick, setCurrentStep]);

  return (
    <Button onClick={() => handleClick()}>
      {currentStep > 2 ? "Try Again" : "Invite"}
    </Button>
  );
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

function BotCheckIn({
  check,
  tries,
  setTries,
  guild,
  onSuccess,
}: BotCheckInProps) {
  const { mutateAsync } = api.guild.isBotIn.useMutation();
  const { currentStep, setCurrentStep } = useSteps();

  const maxTries = 3;

  const checkBotJoined = useCallback(() => {
    if (currentStep === 1) return;

    mutateAsync(guild.id!)
      .then(({ success, value }) => {
        if (success && value) return onSuccess?.(guild, true);

        if (tries >= maxTries) {
          setCurrentStep(4);
        } else if (tries === 0) {
          setCurrentStep(3);
        }

        setTries(tries + 1);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [
    currentStep,
    tries,
    guild,
    setTries,
    setCurrentStep,
    mutateAsync,
    onSuccess,
  ]);

  useEffect(() => {
    if (check) window.addEventListener("focus", checkBotJoined);

    return () => {
      window.removeEventListener("focus", checkBotJoined);
    };
  }, [check, checkBotJoined]);

  return null;
}

function GuildSelect({
  guilds,
  selectedGuild,
  dialogOpen,
  isSuccess,
  setSelectedGuild,
  onDialogOpenChange,
  onSuccess,
}: GuildSelectProps) {
  const { mutateAsync } = api.guild.isBotIn.useMutation();

  const [prevGuild, setPrevGuild] = useState<GuildState>(selectedGuild);
  const [botAlreadyIn, setBotAlreadyIn] = useState(false);

  const value = selectedGuild.id && `${selectedGuild.id}-${selectedGuild.name}`;

  const onGuildSelect = async (guildString: string) => {
    const [id, name] = guildString.split("-");
    const prevGuild = selectedGuild;

    setSelectedGuild({ id, name });
    setPrevGuild(prevGuild);

    const { success, value } = await mutateAsync(id!);

    setBotAlreadyIn(success && value);
    if (success && !value) {
      onDialogOpenChange(true);
      return;
    } else if (!success) {
      ErrorToast.internal()
      setSelectedGuild(prevGuild);
      return;
    }

    onSuccess?.({ id, name }, false);
  };

  useEffect(() => {
    if (!botAlreadyIn && !dialogOpen && !isSuccess) {
      setSelectedGuild(prevGuild);
    }
  }, [botAlreadyIn, dialogOpen, prevGuild, isSuccess, setSelectedGuild]);

  return (
    <Select onValueChange={onGuildSelect} value={value}>
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
  );
}

export function SelectGuild() {
  const { data: session } = useSession();

  const guilds = session ? session.user.guilds : [];
  const storedGuild = localStorage.getItem("selectedGuild");

  const [tries, setTries] = useState(0);
  const [success, setSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [guild, setGuild] = useState<GuildState>(
    JSON.parse(storedGuild ?? "{}") as GuildState,
  );

  const onDialogOpenChange = (open: boolean) => {
    if (!open) setTries(0);
    setDialogOpen(open);
    setSuccess(false);
  };

  const onSuccess = (guild: GuildState, newBot: boolean) => {
    setDialogOpen(false);
    setSuccess(true);

    if (newBot) toast("Bot has been successfully detected!");

    localStorage.setItem("selectedGuild", JSON.stringify(guild));
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
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
              <InviteButton guildId={guild.id!} />
            </DialogFooter>

            <BotCheckIn
              guild={guild}
              check={dialogOpen}
              tries={tries}
              setTries={setTries}
              onSuccess={onSuccess}
            />
          </StepsProvider>
        </DialogContent>
      </Dialog>
      <GuildSelect
        guilds={guilds ?? []}
        selectedGuild={guild}
        dialogOpen={dialogOpen}
        onDialogOpenChange={setDialogOpen}
        setSelectedGuild={setGuild}
        isSuccess={success}
        onSuccess={onSuccess}
      />
    </>
  );
}
