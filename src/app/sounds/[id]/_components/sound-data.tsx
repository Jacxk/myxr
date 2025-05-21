import type { ReactNode } from "react";

export function SoundData({
  title,
  children,
}: Readonly<{
  title: string;
  children: ReactNode;
}>) {
  return (
    <div className="flex flex-row items-center justify-between sm:flex-col sm:items-start sm:justify-normal">
      <span className="w-52 font-semibold">{title}</span>
      <div className="flex flex-wrap justify-end gap-1">{children}</div>
    </div>
  );
}
