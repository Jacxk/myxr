import { TRPCClientError } from "@trpc/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AppRouter } from "~/server/api/root";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isTRPCError(err: unknown): err is TRPCClientError<AppRouter> {
  return err instanceof TRPCClientError;
}
