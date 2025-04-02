"use client";

import TimeAgo from "react-timeago";

export function CreatedDate({ date }: Readonly<{ date: Date }>) {
  return (<TimeAgo date={date} />);
}
