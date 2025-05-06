import { Bell, BellDot } from "lucide-react";
import TimeAgo from "react-timeago";
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

type Notification = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
};

function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <DropdownMenuItem className="flex cursor-default flex-col items-start p-3">
      <div className="flex w-full items-center justify-between">
        <span className="font-medium">{notification.title}</span>
        <span className="text-xs text-muted-foreground">
          <TimeAgo date={notification.createdAt} />
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {notification.description}
      </p>
    </DropdownMenuItem>
  );
}

const notifications: Notification[] = [
  {
    id: "1",
    title: "New follower",
    description: "Pedro has followed you",
    createdAt: new Date(),
  },
];

export function Notifications() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {notifications.length > 0 ? <BellDot /> : <Bell />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-center">
          Mark all read
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
