"use client";

import { type ComponentType, type ReactNode } from "react";
import { signIn } from "~/lib/auth-client";
import { Button } from "./button";

type ButtonProps = {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
};

export function SignInButton({
  children,
  className = "",
  component,
}: {
  children: ReactNode;
  component?: ComponentType<ButtonProps>;
  className?: string;
}) {
  const Component = component ?? Button;

  return (
    <Component
      className={className}
      onClick={() =>
        signIn.social({
          provider: "discord",
          callbackURL: window.location.href,
        })
      }
    >
      {children}
    </Component>
  );
}
