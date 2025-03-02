"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import { PauseIcon } from "~/components/icons/pause";
import { PlayIcon } from "~/components/icons/play";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useSteps } from "~/context/StepsContext";
import { trimAudio } from "~/utils/audioTrimmer";
import { SoundUploadProps } from "./select-file";

export function EditSoundStep() {
  const { data, reset, setData, nextStep } = useSteps<SoundUploadProps>();
  const waveSurfer = useRef<WaveSurfer | null>(null);

  const [totalTime, setTotalTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [fileChanged, setFileChanged] = useState<boolean>(false);
  const [region, setRegion] = useState<{
    start: number;
    end: number;
  }>({ start: data.region?.start ?? 0, end: data.region?.end ?? 5 });

  useEffect(() => {
    const regionsPlugin = RegionsPlugin.create();
    waveSurfer.current = WaveSurfer.create({
      container: "#waveForm",
      barGap: 4,
      barWidth: 2,
      barRadius: 30,
      minPxPerSec: 1,
      dragToSeek: true,
      plugins: [regionsPlugin],
      url: URL.createObjectURL(data.file as Blob),
      normalize: true,
    });

    waveSurfer.current.on("decode", (time) => {
      regionsPlugin.addRegion({
        ...region,
        minLength: 0.01,
        maxLength: 5,
        drag: true,
        color: "rgb(37 99 235 / 0.2)",
        resize: true,
      });
      waveSurfer.current?.setTime(region.start);
      setTotalTime(time);
    });

    regionsPlugin.on("region-update", (region) => {
      setFileChanged(true);
      setRegion({ start: region.start, end: region.end + 0.01 });
      waveSurfer.current?.setTime(region.start);
    });

    waveSurfer.current.on("error", (e) => {
      setIsPlaying(false);
      console.error(e);
    });

    waveSurfer.current.on("pause", () => {
      setIsPlaying(false);
    });

    return () => {
      waveSurfer.current?.destroy();
      regionsPlugin.destroy();
    };
  }, []);

  const playPause = useCallback(() => {
    if (isPlaying) {
      waveSurfer.current?.pause();
    } else {
      const currentStart = waveSurfer.current?.getCurrentTime() ?? region.start;
      const start = currentStart >= region.end ? region.start : currentStart;
      waveSurfer.current?.play(start, region.end);
    }
    setIsPlaying(!isPlaying);
  }, [waveSurfer, region, isPlaying]);

  function goToNextStep() {
    if (!data.file) return;
    if (!fileChanged) {
      nextStep();
      return;
    }
    toast.loading("Editing audio file...", { id: "editingAudio" });
    trimAudio(data.file, region.start, region.end).then((newFile) => {
      setData({ newFile, region, file: data.file });
      toast.dismiss("editingAudio");
      toast("Audio edited successfully!");
      nextStep();
    });
  }

  return (
    <div className="flex h-full flex-col items-center gap-6">
      <div className="flex w-full justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Edit Sound</CardTitle>
            <CardDescription>
              Trim the sound to your liking. Maximum length is 5 seconds, that's
              the maximum discord allows.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 text-muted-foreground">
            <p>
              Drag the ends of the region to adjust the size. You can also
              adjust the position of the region by draging it.
            </p>
            <div className="flex flex-col">
              <span>Name: {data.file?.name}</span>
              <span>Audio Length: {totalTime.toFixed(2)}s</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="w-full touch-none rounded-2xl border p-4">
        <div className="flex flex-row gap-4">
          <div className="relative flex flex-col items-center justify-center">
            <Button
              variant="ghost"
              className="h-16 w-16 cursor-pointer [&_svg]:size-10"
              onClick={playPause}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </Button>
            <span className="absolute bottom-0 text-xs">
              {(region.end - region.start).toFixed(2)}s
            </span>
          </div>
          <div className="w-full" id="waveForm"></div>
        </div>
      </div>
      <div className="flex w-full justify-end gap-4">
        <Button variant="destructive" onClick={reset}>
          Cancel
        </Button>
        <Button onClick={goToNextStep}>Continue</Button>
      </div>
    </div>
  );
}
