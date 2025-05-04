"use client";

import { useMutation } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useTRPC } from "~/trpc/react";

async function downloadFile(url: string, filename: string) {
  toast("Downloading sound!");

  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(blobUrl);
}

export function DownloadButton({
  soundUrl,
  soundId,
  soundName,
  downloads,
}: Readonly<{
  soundUrl: string;
  soundId: string;
  soundName: string;
  downloads: number;
}>) {
  const api = useTRPC();
  const [currentDownloads, setCurrentDownloads] = useState(downloads);
  const { mutate } = useMutation(
    api.sound.download.mutationOptions({
      onSuccess({ success, value }) {
        if (success) setCurrentDownloads(value.downloadCount);
      },
    }),
  );

  const onDownloadClick = async () => {
    mutate({ soundId });
    setCurrentDownloads((currentDownloads) => currentDownloads + 1);

    await downloadFile(soundUrl, soundName).catch(() => {
      setCurrentDownloads((currentDownloads) => currentDownloads - 1);
    });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" onClick={() => onDownloadClick()}>
          <Download />

          {downloads &&
            Intl.NumberFormat(navigator.language, {
              notation: "compact",
            }).format(currentDownloads)}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Download</TooltipContent>
    </Tooltip>
  );
}
