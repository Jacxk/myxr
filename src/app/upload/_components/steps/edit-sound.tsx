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

export function EditSoundStep() {
  const { files, prevStep, setFiles, nextStep } = useSteps();
  const waveSurfer = useRef<WaveSurfer | null>(null);

  const [totalTime, setTotalTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [region, setRegion] = useState<{
    start: number;
    end: number;
  }>({ start: 0, end: 5 });

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
      url: URL.createObjectURL(files[0] as Blob),
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
      setTotalTime(time);
    });

    regionsPlugin.on("region-update", (region) => {
      setRegion({ start: region.start, end: region.end });
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
    if (!files[0]) return;
    toast.loading("Editing audio file...", { id: "editingAudio" });
    trimAudio(files[0], region.start, region.end).then((file) => {
      setFiles([file]);
      toast.dismiss("editingAudio");
      toast("Audio edited successfully!");
      nextStep();
    });
  }

  return (
    <div className="flex h-full flex-col items-center gap-6 overflow-hidden">
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
              <span>Name: {files[0]?.name}</span>
              <span>
                Region Length: {(region.end - region.start).toFixed(2)}s
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="w-full rounded-2xl border p-4">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col items-center justify-center">
            <Button
              variant="ghost"
              className="cursor-pointer"
              onClick={playPause}
            >
              {isPlaying ? (
                <PauseIcon className="size-16" />
              ) : (
                <PlayIcon className="size-24" />
              )}
            </Button>
            <span className="text-xs">{totalTime.toFixed(2)}s</span>
          </div>
          <div className="w-full" id="waveForm"></div>
        </div>
      </div>
      <div className="flex w-full justify-end gap-4">
        <Button variant="destructive" onClick={prevStep}>
          Cancel
        </Button>
        <Button onClick={goToNextStep}>Continue</Button>
      </div>
    </div>
  );
}
