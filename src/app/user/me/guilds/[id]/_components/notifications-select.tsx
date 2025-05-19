"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "~/components/ui/dropdown-menu";
import { ErrorToast } from "~/lib/messages/toast.global";
import { useTRPC } from "~/trpc/react";

export default function NotificationsSelect({ guildId }: { guildId: string }) {
  const api = useTRPC();
  const {
    data: channels,
    isLoading,
    refetch,
  } = useQuery(api.guild.getAllTextChannels.queryOptions({ guildId }));
  const { mutate } = useMutation(
    api.guild.setNotificationsChannel.mutationOptions({
      onSuccess: ({ notificationsChannel }) => {
        if (notificationsChannel) setSelectedChannel(notificationsChannel);
      },
      onError: () => {
        ErrorToast.unauthorized();
      },
    }),
  );

  const [selectedChannel, setSelectedChannel] = useState("");

  const onCheckedChange = (checked: boolean, channelId: string) => {
    setSelectedChannel(checked ? channelId : "");
    mutate({ guildId, channelId: checked ? channelId : null });
  };

  useEffect(() => {
    if (channels) {
      const selected = channels.find((channel) => channel.selected);
      if (selected) {
        setSelectedChannel(selected.id);
      }
    }
  }, [channels]);

  useEffect(() => {
    void refetch();
  }, []);

  return (
    <div className="max-h-[300px] w-56 overflow-y-auto">
      <DropdownMenuLabel className="text-muted-foreground text-xs">
        Select where notifications appear on the guild.
      </DropdownMenuLabel>
      {isLoading && (
        <DropdownMenuCheckboxItem disabled>Loading...</DropdownMenuCheckboxItem>
      )}
      {channels?.length === 0 && (
        <DropdownMenuCheckboxItem disabled>
          No text channels found
        </DropdownMenuCheckboxItem>
      )}
      {channels?.map((channel) => (
        <DropdownMenuCheckboxItem
          onSelect={(event) => event.preventDefault()}
          key={channel.id}
          checked={selectedChannel === channel.id}
          onCheckedChange={(checked) => onCheckedChange(checked, channel.id)}
        >
          {channel.name}
        </DropdownMenuCheckboxItem>
      ))}
    </div>
  );
}
