"use client"

import { useState } from "react";
import { toast } from "sonner";
import { CloudUploadIcon } from "~/components/icons/cloud-upload";
import { useSteps } from "~/context/StepsContext";

export function SelectFileStep() {
  const { files, setFiles, nextStep } = useSteps();
  const [isDragging, setIsDragging] = useState<boolean>(false);

  function onFileSelect(files: File[]) {
    toast("Files selected " + files[0]?.name);
    nextStep();
  }

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (event.dataTransfer.files.length > 0) {
      const uploadedFiles = Array.from(event.dataTransfer.files);
      setFiles(uploadedFiles);
      onFileSelect(uploadedFiles);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      setFiles(selectedFiles);
      onFileSelect(selectedFiles);
    }
  };

  return (
    <label
      htmlFor="file-dropzone"
      className={`mt-0 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 transition hover:border-blue-600 hover:bg-blue-600/20 ${isDragging ? "border-green-600 bg-green-600/20" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CloudUploadIcon className="size-16 text-gray-600" />
      <p className="mt-2 text-gray-600">Choose file or drag and drop</p>
      <input
        id="file-dropzone"
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
      <div>
        <span>{files[0]?.name}</span>
      </div>
    </label>
  );
}
