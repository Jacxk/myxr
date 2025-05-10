"use client";

import { useEffect, useState } from "react";
import { env } from "~/env";
import { cn } from "~/lib/utils";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdDisplayProps = {
  adSlot: string;
  className?: string;
  width?: string;
  height?: string;
  format?: "auto" | "rectangle" | "fluid";
  layoutKey?: string;
  fullWidthResponsive?: boolean;
  showProbability?: number;
};

export default function AdDisplay({
  adSlot,
  className,
  width,
  height,
  format,
  fullWidthResponsive = true,
  showProbability = 0.2,
  layoutKey,
}: AdDisplayProps) {
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
      data-ad-layout-key={layoutKey}
      data-full-width-responsive={fullWidthResponsive}
    ></ins>
  );
}
