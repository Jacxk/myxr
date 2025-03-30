import { Castle, Volume2 } from "lucide-react";
import { TabLink } from "./_components/tab-link";

export default function ({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex flex-row justify-center gap-2 sm:w-1/2 sm:flex-col sm:justify-start lg:w-1/4">
        <TabLink href="/user/me/sounds" className="flex flex-row gap-2">
          <Volume2 />
          <span className="hidden sm:block">My Sounds</span>
        </TabLink>
        <TabLink href="/user/me/guilds" className="flex flex-row gap-2">
          <Castle />
          <span className="hidden sm:block">Guilds</span>
        </TabLink>
      </div>
      {children}
    </div>
  );
}
