import { SiGithub } from "@icons-pack/react-simple-icons";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-7xl grow-0 flex-row justify-between border-t p-6 text-sm text-muted-foreground">
      <div className="grow-1"></div>
      <div className="flex items-center gap-6">
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
        >
          <SiGithub />
        </a>
      </div>
    </footer>
  );
}
