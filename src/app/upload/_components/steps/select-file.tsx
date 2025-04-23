"use client";

import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSteps } from "~/context/StepsContext";
import { cn } from "~/lib/utils";

export interface SoundUploadProps {
  file?: File;
  newFile?: File | null;
  region?: {
    start: number;
    end: number;
  };
}

export function SelectFileStep() {
  const { data, setData, nextStep } = useSteps<SoundUploadProps>();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [validFileType, setValidFileType] = useState<boolean>(false);

  function onFileSelect(files: File[]) {
    toast("File selected " + files[0]?.name);
    nextStep();
  }

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);

    const file = event.dataTransfer.items[0];

    setValidFileType(
      !!file && file.kind === "file" && file.type.includes("audio/"),
    );
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

    if (!validFileType) {
      return toast.error("Invalid file type. Please upload an audio file.");
    }

    if (event.dataTransfer.files.length > 0) {
      const uploadedFiles = Array.from(event.dataTransfer.files);
      setData({ file: uploadedFiles[0] });
      onFileSelect(uploadedFiles);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      setData({ file: selectedFiles[0] });
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
