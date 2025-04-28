"use client";

import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
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

export function EditSoundStep() {
  const { data, reset, setData, nextStep } = useSteps<SoundUploadProps>();

  const region = useRef<Region>(data.region)
  const fileChanged = useRef<boolean>(false)

  const [loading, setLoading] = useState<boolean>(false);
  const [totalTime, setTotalTime] = useState<number>(0);

  const onDecode = (time: number) => {
    if (!data.editedFile) fileChanged.current = true;
    setTotalTime(time);
  };

  const onRegionCreate = (thisRegion: Region) => {
    region.current = thisRegion;
  };

  const onRegionUpdate = (thisRegion: Region) => {
    fileChanged.current = true
    region.current = thisRegion;
  };

  const onError = () => {
    toast.dismiss("fileSelected")
    toast.error("Something went wrong, check the file and try again!");
  }

  function goToNextStep() {
    const currentRegion = region.current;
    if (!data.file || !currentRegion) return;
    if (!fileChanged.current) {
      nextStep();
      return;
    }

    toast.dismiss("fileSelected")
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
        toast("Audio edited successfully!");
        nextStep();
      })
      .catch((error) => {
        console.log(error);
        toast.error("Something went wrong.");
      })
      .finally(() => {
        toast.dismiss("editingAudio");
        setLoading(false);
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
        <Button disabled={loading} onClick={goToNextStep}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Loading
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}
