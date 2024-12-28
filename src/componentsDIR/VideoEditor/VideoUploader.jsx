"use client";

import { useState, useRef, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useVideoStore } from "@/State/store";
import { useToast } from "@/hooks/use-toast";

const VideoUploader = memo(() => {
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const addVideo = useVideoStore((state) => state.addVideo);

  const handleUpload = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith("video/")) {
        setIsUploading(true);
        const reader = new FileReader();
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress((e.loaded / e.total) * 100);
          }
        };
        reader.onload = (e) => {
          const blob = new Blob([e.target.result], { type: file.type });
          const url = URL.createObjectURL(blob);
          setIsUploading(false);
          setProgress(0);

          // a temp video element to get duration
          const video = document.createElement("video");
          video.src = url;
          video.onloadedmetadata = () => {
            const duration = video.duration;
            const canUpload = addVideo({
              videoBlob: blob,
              duration,
              isPlaying: false,
              currentTime: 0,
              startTime: 0,
              endTime: duration,
            });

            if (!canUpload) {
              toast({
                title: "Sorry, the video is too long!",
                description: "Maximum allowed duration is 25 minutes",
              });
            }
          };
        };
        reader.readAsArrayBuffer(file);
      }
    },
    [addVideo]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-[40rem] text-center">
        <Button
          variant="outline"
          className="w-full h-64 hover:!bg-gray-950 border-dashed border-2 !border-gray-400 rounded-lg flex flex-col items-center justify-center"
          onClick={() => fileInputRef.current.click()}
        >
          <Cloud className="w-16 h-16 mb-2" />
          <span>Upload Video</span>
        </Button>
        <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
        {isUploading && <Progress value={progress} className="w-full mt-4" />}
      </div>
    </div>
  );
});

VideoUploader.displayName = "VideoUploader";
export default VideoUploader;

const Cloud = () => {
  return (
    <svg
      width="50"
      height="36"
      className="!w-20 !h-20"
      viewBox="0 0 50 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.75 36H12.625C9.2125 36 6.29725 34.8187 3.87925 32.4562C1.45975 30.0937 0.25 27.2062 0.25 23.7937C0.25 20.8687 1.13125 18.2625 2.89375 15.975C4.65625 13.6875 6.9625 12.225 9.8125 11.5875C10.75 8.1375 12.625 5.34375 15.4375 3.20625C18.25 1.06875 21.4375 0 25 0C29.3875 0 33.109 1.52775 36.1645 4.58325C39.2215 7.64025 40.75 11.3625 40.75 15.75C43.3375 16.05 45.4848 17.1653 47.1918 19.0958C48.8973 21.0278 49.75 23.2875 49.75 25.875C49.75 28.6875 48.766 31.0785 46.798 33.048C44.8285 35.016 42.4375 36 39.625 36H27.25V19.9125L30.85 23.4L34 20.25L25 11.25L16 20.25L19.15 23.4L22.75 19.9125V36Z"
        fill="#F8F8F8"
      />
    </svg>
  );
};
