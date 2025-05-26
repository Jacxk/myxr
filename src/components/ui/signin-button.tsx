"use client";

import { useSearchParams } from "next/navigation";
import { type ComponentType, type ReactNode } from "react";
import { env } from "~/env";
import { signIn } from "~/lib/auth-client";
import { Button } from "./button";

type ButtonProps = {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
};

const BASE_URL = env.NEXT_PUBLIC_DEV_MODE
  ? "http://localhost:3000"
  : env.NEXT_PUBLIC_BASE_URL;

const getRedirectUrl = (path: string | undefined | null) => {
  return path?.startsWith(BASE_URL) ? path : BASE_URL + path;
};

export function SignInButton({
  children,
  className = "",
  component,
  redirect,
}: {
  children: ReactNode;
  component?: ComponentType<ButtonProps>;
  className?: string;
  redirect?: string;
}) {
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get("redirect");
  let redirectUrl: string | undefined;

  const Component = component ?? Button;

  if (redirect) {
    redirectUrl = getRedirectUrl(redirect);
  } else if (redirectParam) {
    redirectUrl = getRedirectUrl(redirectParam);
  }

  return (
    <Component
      className={className}
      onClick={() =>
        signIn.social({
          provider: "discord",
          callbackURL: redirectUrl ?? window.location.href,
        })
      }
    >
      {children}
    </Component>
  );
}
