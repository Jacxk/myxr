"use client";

import { useEffect, useState } from "react";
import { env } from "~/env";
import { cn } from "~/lib/utils";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdDisplay({
  adSlot,
  className,
  width = "160px",
  height = "160px",
  format,
  fullWidthResponsive = true,
  showProbability = 0.2,
}: {
  adSlot: string;
  className?: string;
  width?: string;
  height?: string;
  format?: "auto" | "rectangle";
  fullWidthResponsive?: boolean;
  showProbability?: number;
}) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const random = Math.random();
    setShouldShow(random < showProbability);
  }, [showProbability]);

  useEffect(() => {
    if (!shouldShow) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, [shouldShow]);

  if (!shouldShow) return null;

  const displayAdSlot = env.NEXT_PUBLIC_DEV_MODE ? "0000000000" : adSlot;

  return (
    <ins
      className={cn("adsbygoogle", className)}
      style={{
        display: "inline-block",
        width,
        height,
      }}
      data-ad-client={env.NEXT_PUBLIC_ADSENSE_KEY}
      data-ad-slot={displayAdSlot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive}
    ></ins>
  );
}
