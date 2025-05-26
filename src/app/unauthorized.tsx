"use client";

import { redirect, usePathname } from "next/navigation";

export default function UnAuthorizedPage() {
  const path = usePathname();

  redirect(`/login?redirect=${encodeURIComponent(path)}`);
}
