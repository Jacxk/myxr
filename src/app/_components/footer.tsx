import { SiGithub } from "@icons-pack/react-simple-icons";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="text-muted-foreground mx-auto flex w-full max-w-7xl grow-0 flex-row items-center justify-between border-t p-6 text-sm">
      <div className="text-foreground text-xl font-semibold">
        <Link href="/">myxr</Link>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <Link href="/legal/privacy-policy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link href="/legal/terms" className="hover:underline">
          Terms of Service
        </Link>
        <Link href="/legal/dmca" className="hover:underline">
          DMCA Policy
        </Link>
      </div>
      <div className="flex">
        <a
          href="https://github.com/jacxk/myxr"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary"
        >
          <SiGithub />
        </a>
      </div>
    </footer>
  );
}
