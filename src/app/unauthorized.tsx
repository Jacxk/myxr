import { SiDiscord } from "@icons-pack/react-simple-icons";
import { ExternalLink, Headphones, Music, Users, Volume2 } from "lucide-react";
import Link from "next/link";
import { Main } from "~/components/main";
import { SignInButton } from "~/components/ui/signin-button";

export default function LoginPage() {
  return (
    <Main className="w-full max-w-md flex-1 justify-center">
      <div className="gap-4 text-center">
        <h1 className="text-2xl font-bold">Login to myxr</h1>
        <p className="text-muted-foreground">
          Sign in with Discord to create sounds and manage your guild&apos;s
          soundboard.
        </p>
      </div>

      <div className="bg-muted rounded-lg p-4">
        <h3 className="mb-3 text-center font-semibold">Get access to:</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-muted-foreground/50 flex h-8 w-8 items-center justify-center rounded-full">
              <Music className="h-4 w-4" />
            </div>
            <span className="text-sm">Upload and share your sounds</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-muted-foreground/50 flex h-8 w-8 items-center justify-center rounded-full">
              <Volume2 className="h-4 w-4" />
            </div>
            <span className="text-sm">Manage your guild&apos;s soundboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-muted-foreground/50 flex h-8 w-8 items-center justify-center rounded-full">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-sm">Follow other users</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-muted-foreground/50 flex h-8 w-8 items-center justify-center rounded-full">
              <Headphones className="h-4 w-4" />
            </div>
            <span className="text-sm">Save sounds to your profile</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SignInButton className="h-auto w-full bg-[#5865F2] py-3 font-medium text-white hover:bg-[#4752C4]">
          <div className="flex items-center justify-center gap-3">
            <SiDiscord />
            <span>Continue with Discord</span>
            <ExternalLink className="h-4 w-4" />
          </div>
        </SignInButton>

        <div className="text-center">
          <p className="text-muted-foreground text-xs">
            By continuing, you agree to our{" "}
            <Link
              href="/legal/terms"
              className="text-white hover:underline"
              prefetch={false}
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/privacy"
              className="text-white hover:underline"
              prefetch={false}
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </Main>
  );
}
