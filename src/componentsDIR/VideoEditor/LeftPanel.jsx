"use client";

import { memo, useState, useRef, useEffect, useCallback } from "react";
import { Video, Image, Type, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVideoStore } from "@/State/store";
import { useToast } from "@/hooks/use-toast";

const LeftPanel = memo(() => {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);
  const videos = useVideoStore((state) => state.videos);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    <div className="fixed bg-black left-4 z-[4] top-[37%] transform -translate-y-1/2" ref={menuRef}>
      <TooltipProvider>
        <div className="bg-background rounded-lg shadow-lg flex flex-col space-y-1 p-2">
          <MenuButton icon={<Video className="h-5 w-5" />} tooltip="Upload Video" onClick={() => toggleMenu("video")} />
          <MenuButton icon={<Type className="h-5 w-5" />} tooltip="Add Text" onClick={() => toggleMenu("text")} />
          <MenuButton icon={<Image className="h-5 w-5" />} tooltip="Upload Photo" onClick={() => toggleMenu("photo")} />
        </div>

        {openMenu === "video" && (
          <MenuContent key={"1"}>
            <Tabs defaultValue="your-media" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="your-media" className="flex-1">
                  Your Media
                </TabsTrigger>
                <TabsTrigger value="upload-new" className="flex-1">
                  Upload New
                </TabsTrigger>
              </TabsList>
              <TabsContent value="your-media" className="mt-0">
                <div className="flex flex-wrap gap-5 justify-start mx-auto max-h-[240px] overflow-y-auto pr-2">
                  {videos.map((video, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 rounded-lg bg-accent/50 border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
                    >
                      <video
                        src={video.src}
                        className="h-full w-full rounded-md object-cover"
                        preload="metadata"
                        muted
                        playsInline
                        onLoadedData={(e) => {
                          const videoEl = e.currentTarget;
                          videoEl.currentTime = 8; // Set to first frame
                        }}
                      />
                    </div>
                    // <div
                    //   key={index}
                    //   className="w-16 h-16 rounded-lg bg-accent/50 border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
                    // >
                    //   <Video className="w-6 h-6 text-muted-foreground" />
                    // </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="upload-new" className="mt-0">
                <Label
                  htmlFor="video-upload"
                  className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <span>Upload Video</span>
                  </div>
                  <Input
                  ref={fileInputRef}
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </Label>
              </TabsContent>
            </Tabs>
          </MenuContent>
        )}

        {openMenu === "photo" && (
          <MenuContent key={2}>
            <Tabs defaultValue="your-media" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="your-media" className="flex-1">
                  Your Media
                </TabsTrigger>
                <TabsTrigger value="upload-new" className="flex-1">
                  Upload New
                </TabsTrigger>
              </TabsList>
              <TabsContent value="your-media" className="mt-0">
                <div className="flex flex-wrap gap-5 ustify-start mx-auto max-h-[240px] overflow-y-auto pr-2">
                  {videos.map((_, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 rounded-lg bg-accent/50 border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
                    >
                      <Image className="w-6 h-6 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="upload-new" className="mt-0">
                <Label
                  htmlFor="photo-upload"
                  className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <span>Upload Photo</span>
                  </div>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => console.log("Photo file:", e.target.files?.[0])}
                  />
                </Label>
              </TabsContent>
            </Tabs>
          </MenuContent>
        )}

        {openMenu === "text" && (
          <MenuContent key={3}>
            <div className="flex justify-center gap-4 flex-col h-28">
              <Input
                placeholder="Enter your text"
                className="h-9"
                value={text}
                onChange={(e) => setText(e.target.value)}
                ref={(el) => el && el.focus()}
              />
              <Button
                className="w-full"
                onClick={() => {
                  console.log("Text added:", text);
                  setText("");
                }}
              >
                Add Text
              </Button>
            </div>
          </MenuContent>
        )}
      </TooltipProvider>
    </div>
  );
});
LeftPanel.displayName = "LeftPanel";

export default LeftPanel;

function MenuButton({ icon, tooltip, onClick }) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-md hover:bg-accent" onClick={onClick}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function MenuContent({ children }) {
  return (
    <div className="absolute bg-black left-full ml-7 top-0 w-72 bg-background border border-gray-500 rounded-lg shadow-lg p-4 transition-all ease-out duration-300 transform translate-y-0 opacity-100 animate-slide-up">
      {children}
    </div>
  );
}
