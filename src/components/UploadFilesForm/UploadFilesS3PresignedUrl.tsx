import { useState } from "react";
import {
  validateFiles,
  MAX_FILE_SIZE_S3_ENDPOINT,
  handleUpload,
  getPresignedUrls,
} from "@/lib/fileUploadHelpers";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { LoadSpinner } from "../LoadSpinner";
import { type ShortFileProp } from "@/lib/types";

type UploadFilesFormProps = {
  onUploadSuccess: () => void;
};

export function UploadFilesS3PresignedUrl({
  onUploadSuccess,
}: UploadFilesFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const maxSizeMB = MAX_FILE_SIZE_S3_ENDPOINT;
  const maxSize = maxSizeMB * 1024 * 1024;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
      clearFiles,
    },
  ] = useFileUpload({
    maxSize,
    multiple: true,
  });

  const uploadToServer = async () => {
    if (!files.length) {
      alert("Please, select file you want to upload");
      return;
    }
    
    const fileObjects = files.map(f => f.file as File);
    const filesInfo: ShortFileProp[] = fileObjects.map((file) => ({
      originalFileName: file.name,
      fileSize: file.size,
    }));

    const filesValidationResult = validateFiles(
      filesInfo,
      MAX_FILE_SIZE_S3_ENDPOINT,
    );
    if (filesValidationResult) {
      alert(filesValidationResult);
      return;
    }
    setIsLoading(true);

    const presignedUrls = await getPresignedUrls(filesInfo);
    if (!presignedUrls?.length) {
      alert("Something went wrong, please try again later");
      setIsLoading(false);
      return;
    }

    await handleUpload(fileObjects, presignedUrls, () => {
      clearFiles();
      onUploadSuccess();
    });

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <h1 className="text-2xl">
        File upload example using Next.js, MinIO S3, Prisma and PostgreSQL
      </h1>
      <p className="text-lg">{`Total file(s) size should not exceed ${maxSizeMB} MB`}</p>
      
      <div className="flex flex-col gap-2 w-full max-w-md">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          data-files={files.length > 0 || undefined}
          className="relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload file"
          />
          {files.length > 0 ? (
            <div className="flex w-full flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-medium">
                  Uploaded Files ({files.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openFileDialog}
                >
                  <UploadIcon
                    className="-ms-0.5 size-3.5 opacity-60"
                    aria-hidden="true"
                  />
                  Add more
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="relative flex items-center gap-2 rounded-md bg-accent p-2"
                  >
                    <span className="text-sm truncate">{file.file.name}</span>
                    <Button
                      onClick={() => removeFile(file.id)}
                      size="icon"
                      variant="ghost"
                      className="size-6 rounded-full"
                      aria-label="Remove file"
                    >
                      <XIcon className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                aria-hidden="true"
              >
                <ImageIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">Drop your files here</p>
              <p className="text-xs text-muted-foreground">
                Any file type (max. {maxSizeMB}MB)
              </p>
              <Button variant="outline" className="mt-4" onClick={openFileDialog}>
                <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
                Select files
              </Button>
            </div>
          )}
        </div>

        {errors.length > 0 && (
          <div
            className="flex items-center gap-1 text-xs text-destructive"
            role="alert"
          >
            <AlertCircleIcon className="size-3 shrink-0" />
            <span>{errors[0]}</span>
          </div>
        )}

        {files.length > 0 && (
          <Button
            onClick={uploadToServer}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? <LoadSpinner /> : "Upload Files"}
          </Button>
        )}
      </div>
    </div>
  );
}
