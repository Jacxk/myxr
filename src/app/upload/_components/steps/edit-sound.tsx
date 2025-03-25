"use client";

import { useState } from "react";
import { toast } from "sonner";
import { type Region } from "wavesurfer.js/dist/plugins/regions.esm.js";
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
import { trimAudioAndConvertToMp3 } from "~/utils/audioTrimmer";
import { type SoundUploadProps } from "./select-file";

type LocalRegion = {
  start: number;
  end: number;
};

export function EditSoundStep() {
  const { data, reset, setData, nextStep } = useSteps<SoundUploadProps>();

  const [totalTime, setTotalTime] = useState<number>(0);
  const [fileChanged, setFileChanged] = useState<boolean>(false);
  const [region, setRegion] = useState<LocalRegion>({
    start: data.region?.start ?? 0,
    end: data.region?.end ?? 5,
  });

  const onDecode = (time: number) => {
    if (!data.newFile) setFileChanged(true);
    setTotalTime(time);
  };

  const onRegionUpdate = (region: Region) => {
    setFileChanged(true);
    setRegion(region);
  };

  function goToNextStep() {
    if (!data.file) return;
    if (!fileChanged) {
      nextStep();
      return;
    }
    toast.loading("Editing audio file...", { id: "editingAudio" });
    trimAudioAndConvertToMp3(data.file, region.start, region.end + 0.01)
      .then((newFile) => {
        setData({ newFile, region, file: data.file });
        toast("Audio edited successfully!");
        nextStep();
      })
      .catch((error) => {
        console.log(error);
        toast.error("Something went wrong.");
      })
      .finally(() => {
        toast.dismiss("editingAudio");
      });
  }

  return (
    <div className="flex h-full flex-col items-center gap-6">
      <div className="flex w-full justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Edit Sound</CardTitle>
            <CardDescription>
              Trim the sound to your liking. Maximum length is 5 seconds,
              that&apos;s the maximum discord allows.
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
      <SoundWaveForm
        url={URL.createObjectURL(data.file as Blob)}
        regionData={data.region}
        onDecode={onDecode}
        onRegionUpdate={onRegionUpdate}
        editable
      />
      <div className="flex w-full justify-end gap-4">
        <Button variant="destructive" onClick={reset}>
          Cancel
        </Button>
        <Button onClick={goToNextStep}>Continue</Button>
      </div>
    </div>
  );
}
