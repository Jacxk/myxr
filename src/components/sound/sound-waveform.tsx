"use client";

import { Pause, Play } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin, {
  type Region,
} from "wavesurfer.js/dist/plugins/regions.js";
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.esm.js";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
type SoundWaveFromProps = {
  url: string;
  id?: string;
  editable?: boolean;
  regionData?: Region;
  onDecode?: (time: number) => void;
  onRegionUpdate?: (region: Region) => void;
  onRegionCreate?: (region: Region) => void;
  onError?: (error: Error) => void;
};

export function SoundWaveForm({
  url,
  id,
  editable,
  regionData,
  onDecode,
  onRegionUpdate,
  onRegionCreate,
  onError,
}: Readonly<SoundWaveFromProps>) {
  const waveSurfer = useRef<WaveSurfer>(undefined);
  const regionsPlugin =
    useRef<ReturnType<typeof RegionsPlugin.create>>(undefined);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);

  const posthog = usePostHog();

  const initializeWaveSurfer = useCallback(() => {
    waveSurfer.current = WaveSurfer.create({
      container: "#waveForm",
      barGap: 4,
      barWidth: 2,
      barRadius: 30,
      minPxPerSec: 1,
      dragToSeek: false,
      normalize: true,
      autoCenter: false,
      interact: false,
      url,
    });
    if (editable) {
      regionsPlugin.current = RegionsPlugin.create();
      const zoomPlugin = ZoomPlugin.create();

      waveSurfer.current.registerPlugin(regionsPlugin.current);
      waveSurfer.current.registerPlugin(zoomPlugin);

      waveSurfer.current.on("destroy", () => {
        zoomPlugin.destroy();
      });

      waveSurfer.current.on("decode", (time) => {
        onDecode?.(time);

        const currentRegion = regionsPlugin.current;

        if (currentRegion && currentRegion.getRegions().length > 0) return;

        regionsPlugin.current?.addRegion({
          start: 0,
          end: time > 5 ? 5 : time,
          ...regionData,
          minLength: 0.01,
          maxLength: 5,
          drag: true,
          color: "rgb(37 99 235 / 0.2)",
          resize: true,
        });
      });

      regionsPlugin.current?.on("region-created", (region) => {
        onRegionCreate?.(region);
      });

      regionsPlugin.current?.on("region-update", (region) => {
        onRegionUpdate?.(region);
        waveSurfer.current?.pause();
        waveSurfer.current?.setTime(region.start);
      });
    }

    waveSurfer.current.on("error", (e) => {
      setIsPlaying(false);
      onError?.(e);
      console.error(e);
    });

    waveSurfer.current.on("pause", () => {
      setIsPlaying(false);
    });

    waveSurfer.current.on("timeupdate", (time) => {
      setCurrentTime(time);
    });

    waveSurfer.current.on("ready", () => {
      setIsReady(true);
    });

    waveSurfer.current.on("finish", () => {
      waveSurfer.current?.seekTo(0);
    });
  }, [
    editable,
    url,
    regionData,
    onDecode,
    onRegionCreate,
    onRegionUpdate,
    onError,
  ]);

  const destroyWaveSurfer = () => {
    waveSurfer.current?.destroy();
    regionsPlugin.current?.destroy();
  };

  useEffect(() => {
    initializeWaveSurfer();
    return () => destroyWaveSurfer();
  }, []);

  const playPause = useCallback(() => {
    setIsPlaying((playing) => {
      if (playing) {
        waveSurfer.current?.pause();
      } else if (editable) {
        const regions = regionsPlugin.current?.getRegions();
        const singleRegion = regions?.[0];

        if (singleRegion) singleRegion.play(true);
      } else {
        void waveSurfer.current?.play();

        if (id) {
          posthog.capture("Sound Played", {
            sound_id: id,
            sound_url: url,
          });
        }
      }
      return !playing;
    });
  }, [editable, id, url, posthog]);

  return (
    <div className="text-muted-foreground w-full touch-none rounded-2xl border p-4">
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
        <div
          className={cn("w-full overflow-hidden transition-all duration-500", {
            "bg-muted animate-pulse": !isReady,
            "scale-100 opacity-100": isReady,
            "scale-95 opacity-50": !isReady,
          })}
          id="waveForm"
        ></div>
      </div>
    </div>
  );
}
