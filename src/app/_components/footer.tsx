import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex grow-0 flex-col border-t py-4 text-center text-sm text-muted-foreground">
      <p>
        Created by{" "}
        <a
          href="https://github.com/jacxk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Jacxk
        </a>
        . View the project on{" "}
        <a
          href="https://github.com/jacxk/myxr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          GitHub
        </a>
        .
      </p>
      <p>
        <Link
          href="/legal/privacy-policy"
          className="text-blue-500 hover:underline"
        >
          Privacy Policy
        </Link>{" "}
        &middot;{" "}
        <Link href="/legal/terms" className="text-blue-500 hover:underline">
          Terms of Service
        </Link>
      </p>
    </footer>
  );
}
