"use client";

import { usePostHog } from "posthog-js/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { type Region } from "wavesurfer.js/dist/plugins/regions.esm.js";
import AdDisplay from "~/components/ad/ad-display";
import { SoundWaveForm } from "~/components/sound/sound-waveform";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useSteps } from "~/context/StepsContext";
import { ErrorToast } from "~/lib/messages/toast.global";
import { trimAudioAndConvertToMp3 } from "~/utils/audioTrimmer";
import { type SoundUploadProps } from "./select-file";

export function EditSoundStep() {
  const posthog = usePostHog();
  const { data, reset, setData, nextStep } = useSteps<SoundUploadProps>();

  const region = useRef<Region>(data.region);
  const fileChanged = useRef<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<number>(0);

  const onDecode = (time: number) => {
    if (!data.editedFile) fileChanged.current = true;
    setTotalTime(time);
  };

  const onRegionCreate = (thisRegion: Region) => {
    region.current = thisRegion;
    setSelectedTime(Math.abs(thisRegion.start - thisRegion.end));
  };

  const onRegionUpdate = (thisRegion: Region) => {
    fileChanged.current = true;
    region.current = thisRegion;
    setSelectedTime(Math.abs(thisRegion.start - thisRegion.end));
  };

  const onError = () => {
    toast.dismiss("fileSelected");
    toast.error("Something went wrong, check the file and try again!");
  };

  function goToNextStep() {
    const currentRegion = region.current;
    if (!data.file || !currentRegion) return;
    if (!fileChanged.current) {
      nextStep();
      return;
    }

    toast.dismiss("fileSelected");
    toast.loading("Editing audio file...", { id: "editingAudio" });

    setLoading(true);

    trimAudioAndConvertToMp3(data.file, currentRegion.start, currentRegion.end)
      .then((newFile) => {
        setData({
          ...data,
          editedFile: newFile,
          region: region.current,
          file: data.file,
          fileProps: {
            ...data.fileProps,
            url: URL.createObjectURL(newFile as Blob),
          },
        });

        posthog.capture("Sound create - edited", {
          fileName: data.file.name,
        });
        toast("Audio edited successfully!");
        nextStep();
      })
      .catch((error) => {
        console.log(error);
        ErrorToast.internal();
      })
      .finally(() => {
        toast.dismiss("editingAudio");
        setLoading(false);
      });
  }

  return (
    <div className="flex h-full flex-col items-center gap-6">
      <div className="flex w-full justify-between gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Sound</CardTitle>
            <CardDescription>
              Trim the sound to your liking. Maximum length is 5 seconds,
              that&apos;s the maximum discord allows.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground flex flex-col gap-6">
            <div className="flex flex-col">
              <span>Name: {data.file?.name}</span>
              <span>Audio Length: {totalTime.toFixed(2)}s</span>
              <span>Selected Length: {selectedTime.toFixed(2)}s</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>How it works:</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <ul className="list-disc">
              <li>Drag the ends of the region to adjust the size.</li>
              <li>Adjust the position of the region by draging it.</li>
              <li>You zoom in and out by scrolling on the waveform.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <SoundWaveForm
        url={URL.createObjectURL(data.file as Blob)}
        regionData={region.current}
        onDecode={onDecode}
        onRegionCreate={onRegionCreate}
        onRegionUpdate={onRegionUpdate}
        onError={onError}
        editable
      />
      <div className="flex w-full justify-end gap-4">
        <Button variant="destructive" onClick={reset}>
          Cancel
        </Button>
        <Button onClick={goToNextStep} loading={loading}>
          Continue
        </Button>
      </div>

      <AdDisplay
        adSlot="1944402367"
        height="100%"
        className="w-full"
        showProbability={1}
      />
    </div>
  );
}
