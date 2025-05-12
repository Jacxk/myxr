"use client";

import { AdUnit } from "next-google-adsense";
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

  const isDev = env.NEXT_PUBLIC_DEV_MODE;

  if (!shouldShow || isDev) return null;

  return (
    <AdUnit
      slotId={adSlot}
      layout="custom"
      publisherId={env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
      customLayout={(() => (
        <ins
          className={cn("adsbygoogle", className)}
          style={{
            display: "inline-block",
            width,
            height,
          }}
          data-ad-client={env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
          data-ad-slot={adSlot}
          data-ad-format={format}
          data-ad-layout-key={layoutKey}
          data-full-width-responsive={fullWidthResponsive}
        ></ins>
      ))()}
    />
  );
}
