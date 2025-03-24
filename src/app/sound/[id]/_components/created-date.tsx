"use client";

import TimeAgo from "react-timeago";

export function CreatedDate({ date }: Readonly<{ date: Date }>) {
  return (
    <div className="flex flex-col">
      <span className="text-lg font-semibold">Created</span>
      <TimeAgo date={date} />
    </div>
  );
}
