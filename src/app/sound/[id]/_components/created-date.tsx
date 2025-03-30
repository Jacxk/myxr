"use client";

import TimeAgo from "react-timeago";

export function CreatedDate({
  date,
  className,
}: Readonly<{ date: Date; className?: string }>) {
  return (
    <div className={`flex ${className}`}>
      <span className="w-52 font-semibold">Created</span>
      <TimeAgo date={date} />
    </div>
  );
}
