import { TabLink } from "./_components/tab-link";

export default function ({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row gap-4">
      <div className="flex flex-col gap-2 w-52">
        <TabLink
          href="/user/me/sounds"
        >
          My Sounds
        </TabLink>
        <TabLink
          href="/user/me/guilds"
        >
          Guilds
        </TabLink>
      </div>
      {children}
    </div>
  );
}
