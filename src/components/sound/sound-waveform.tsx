"use client";

import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin, {
  type Region,
} from "wavesurfer.js/dist/plugins/regions.js";
import { Button } from "../ui/button";

type SoundWaveFromProps = {
  url: string;
  editable?: boolean;
  regionData?: LocalRegion;
  onDecode?: (time: number) => void;
  onRegionUpdate?: (region: Region) => void;
  onRegionCreate?: (region: Region) => void;
};

type LocalRegion = {
  start: number;
  end: number;
};

export function SoundWaveForm({
  url,
  editable,
  regionData,
  onDecode,
  onRegionUpdate,
  onRegionCreate,
}: Readonly<SoundWaveFromProps>) {
  const waveSurfer = useRef<WaveSurfer>(undefined);
  const regionsPlugin =
    useRef<ReturnType<typeof RegionsPlugin.create>>(undefined);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [region, setRegion] = useState<LocalRegion>({
    start: regionData?.start ?? 0,
    end: regionData?.end ?? 5,
  });

  const initializeWaveSurfer = useCallback(() => {
    regionsPlugin.current = RegionsPlugin.create();
    waveSurfer.current = WaveSurfer.create({
      container: "#waveForm",
      barGap: 4,
      barWidth: 2,
      barRadius: 30,
      minPxPerSec: 1,
      dragToSeek: true,
      normalize: true,
      plugins: [regionsPlugin.current],
      url,
    });

    if (editable) {
      waveSurfer.current.on("decode", (time) => {
        onDecode?.(time);
        if (time <= region.end) setRegion({ ...region, end: time });

        regionsPlugin.current?.clearRegions();
        regionsPlugin.current?.addRegion({
          ...region,
          minLength: 0.01,
          maxLength: 5,
          drag: true,
          color: "rgb(37 99 235 / 0.2)",
          resize: true,
        });
        waveSurfer.current?.setTime(region.start);
      });

      regionsPlugin.current?.on("region-created", (region) => {
        onRegionCreate?.(region);
      });

      regionsPlugin.current?.on("region-update", (region) => {
        onRegionUpdate?.(region);
        setRegion({ start: region.start, end: region.end });
        waveSurfer.current?.setTime(region.start);
      });
    }

    waveSurfer.current.on("error", (e) => {
      setIsPlaying(false);
      console.error(e);
    });

    waveSurfer.current.on("pause", () => {
      setIsPlaying(false);
    });

    waveSurfer.current.on("timeupdate", (time) => {
      if (editable) setCurrentTime(Math.abs(time - region.start));
      else setCurrentTime(time);
    });
  }, [editable, region, url, onDecode, onRegionCreate, onRegionUpdate]);

  const destroyWaveSurfer = useCallback(() => {
    waveSurfer.current?.destroy();
    regionsPlugin.current?.destroy();
  }, []);

  useEffect(() => {
    initializeWaveSurfer();
    return () => destroyWaveSurfer();
  }, []);

  const playPause = useCallback(() => {
    setIsPlaying((playing) => {
      if (playing) {
        waveSurfer.current?.pause();
      } else if (editable) {
        const currentStart =
          waveSurfer.current?.getCurrentTime() ?? region.start;
        const start = currentStart >= region.end ? region.start : currentStart;
        void waveSurfer.current!.play(start, region.end);
      } else {
        void waveSurfer.current?.play();
      }
      return !playing;
    });
  }, [editable, region]);

  return (
    <div className="w-full touch-none rounded-2xl border p-4 text-muted-foreground">
      <div className="flex flex-row gap-4">
        <div className="relative flex flex-col items-center justify-center">
          <Button
            variant="ghost"
            className="h-16 w-16 cursor-pointer [&_svg]:size-10"
            onClick={playPause}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
          <span className="absolute bottom-0 text-xs">
            {currentTime.toFixed(2)}s
          </span>
        </div>
        <div className="w-full" id="waveForm"></div>
      </div>
    </div>
  );
}
