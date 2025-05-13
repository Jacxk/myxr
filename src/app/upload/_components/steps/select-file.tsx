"use client";

import { UploadCloud } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Region } from "wavesurfer.js/dist/plugins/regions.js";
import { useSteps } from "~/context/StepsContext";
import { useSession } from "~/lib/auth-client";
import { ErrorToast } from "~/lib/messages/toast.global";
import { cn } from "~/lib/utils";

type FileProps = {
  name: string;
  emoji: string;
  url: string;
  tags?: { name: string }[];
};

type UploadUser = {
  id: string;
  name: string;
  image: string;
  role: string;
};

export type SoundUploadProps = {
  user: UploadUser;
  file: File;
  fileProps: FileProps;
  editedFile?: File;
  region?: Region;
};

export function SelectFileStep() {
  const posthog = usePostHog();
  const { data: session } = useSession();
  const { data, setData, nextStep } = useSteps<SoundUploadProps>();

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [validFileType, setValidFileType] = useState<boolean>(false);

  function initializeData(file: File) {
    if (!session) return;
    const fileName = file.name.split(".")[0] ?? "Unknown";

    posthog.capture("Sound create - started", {
      fileName: file.name,
    });

    toast("File selected " + fileName, { id: "fileSelected" });
    setData({
      ...data,
      file,
      user: session.user as UploadUser,
      fileProps: {
        name: fileName,
        emoji: "🎵",
        url: URL.createObjectURL(file as Blob),
      },
    });
  }

  function validateFile(file: File | DataTransferItem | null | undefined) {
    const valid = !!file && file.type.includes("audio/");

    setValidFileType(valid);

    return valid;
  }

  function onFileSelect(files: File[]) {
    const file = files[0];
    if (!file) return;

    if (!validateFile(file)) {
      return ErrorToast.invalidAudioFile();
    }

    initializeData(file);
    nextStep();
  }

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.items[0];

    setIsDragging(true);
    validateFile(file);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    setValidFileType(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    setValidFileType(false);

    if (event.dataTransfer.files.length > 0) {
      const uploadedFiles = Array.from(event.dataTransfer.files);
      onFileSelect(uploadedFiles);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);

      if (!selectedFiles[0]) return;
      setData({ ...data, file: selectedFiles[0] });
      onFileSelect(selectedFiles);
    }
  };

  const textColor = cn("mt-2 text-gray-600 transition", {
    "text-green-600": isDragging,
    "text-red-600": isDragging && !validFileType,
  });

  return (
    <label
      htmlFor="file-dropzone"
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed",
        "h-full border-gray-300 p-4 transition hover:border-blue-600 hover:bg-blue-600/20",
        {
          "animate-pulse": isDragging && !validFileType,
          "border-green-600 bg-green-600/20": isDragging,
          "border-red-600 bg-red-600/20": isDragging && !validFileType,
        },
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <UploadCloud className={cn("size-16", textColor)} />
      <p className={textColor}>Choose file or drag and drop</p>
      <input
        id="file-dropzone"
        type="file"
        className="hidden"
        accept="audio/*"
        onChange={handleFileChange}
      />
      <div>
        <span>{data.file?.name}</span>
      </div>
    </label>
  );
}
