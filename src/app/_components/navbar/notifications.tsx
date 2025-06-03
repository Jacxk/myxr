"use client";

import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Bell, BellDot, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import TimeAgo from "react-timeago";
import { InfiniteScroll } from "~/components/infinite-scroll";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/react";

type Notification = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  read: boolean;
};

function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <DropdownMenuItem
      className={cn(
        "flex cursor-default flex-col items-start p-3",
        !notification.read && "border-l-primary border-l-4",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="font-medium">{notification.title}</span>
        <span className="text-muted-foreground text-xs">
          <TimeAgo date={notification.createdAt} />
        </span>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        {notification.description}
      </p>
    </DropdownMenuItem>
  );
}

export function Notifications() {
  const api = useTRPC();
  const { data, isLoading, isRefetching, hasNextPage, refetch, fetchNextPage } =
    useInfiniteQuery(
      api.user.getNotifications.infiniteQueryOptions(
        { limit: 5 },

        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
      ),
    );
  const { mutate } = useMutation(
    api.user.handleNotification.mutationOptions({
      onSuccess: () => {
        void refetch();
      },
    }),
  );

  const [open, setOpen] = useState(false);

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const isAnyUnread =
    !open && notifications.some((notification) => !notification.read);

  useEffect(() => {
    if (open) {
      void refetch();
      return;
    }

    if (isAnyUnread) {
      mutate({ type: "markAllAsRead" });
    }
  }, [open]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-background/30">
          {isAnyUnread ? (
            <BellDot className={cn(isAnyUnread && "animate-pulse")} />
          ) : (
            <Bell />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-background/30 w-80 backdrop-blur-2xl"
        align="end"
      >
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>Notifications</span>
            <Button onClick={() => refetch()} variant="ghost" size="icon">
              <RefreshCw className={isRefetching ? "animate-spin" : ""} />
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          <InfiniteScroll
            data={notifications}
            displayType="list"
            renderListItem={(item) => <NotificationItem notification={item} />}
            listEstimatedSize={100}
            loadMore={fetchNextPage}
            hasMore={hasNextPage}
            isLoading={isLoading}
            endMessage={
              notifications.length === 0 ? (
                <DropdownMenuItem className="flex justify-center" disabled>
                  No notifications
                </DropdownMenuItem>
              ) : null
            }
            manualTrigger={false}
            useTypeToggle={false}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex justify-center"
          onClick={() => mutate({ type: "deleteAll" })}
        >
          Delete all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
