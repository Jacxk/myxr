import Link from "next/link";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";

function CountSection({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-4xl font-bold">
        {Intl.NumberFormat().format(count)}
      </span>
      <span className="text-muted-foreground text-sm">{title}</span>
    </div>
  );
}
export async function HeroSection() {
  const { soundCount, userCount, guildCount } =
    await api.global.getGlobalStats();

  return (
    <div className="to-background mx-0 mb-20 flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-blue-500/30 pt-20 sm:-mt-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to myxr
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Create, share, and discover amazing sound effects for your Discord
          server. Join our community of sound enthusiasts.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8">
        <CountSection title="Total Sounds" count={soundCount} />
        <CountSection title="Active Users" count={userCount} />
        <CountSection title="Total Guilds" count={guildCount} />
      </div>

      <div className="flex gap-4">
        <Button size="lg" asChild>
          <Link href="/upload">Upload Sound</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/sound">Browse Sounds</Link>
        </Button>
      </div>
    </div>
  );
}
