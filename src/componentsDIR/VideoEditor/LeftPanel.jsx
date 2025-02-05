"use client";

import { memo, useState, useRef, useEffect, useCallback } from "react";
import { Video, Image, Type, Upload, X, Download, Loader2, Github, Music, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVideoStore } from "@/State/store";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RecordAudio from "@/components/ui/RecordingAudio";

const LeftPanel = memo(() => {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);
  const videos = useVideoStore((state) => state.videos);
  const images = useVideoStore((state) => state.images);
  const addImageOnTL = useVideoStore((state) => state.addImageOnTL);
  const deleteImageFromTL = useVideoStore((state) => state.deleteImageFromTL);
  const deleteVideo = useVideoStore((state) => state.deleteVideo);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const addTextsOnTL = useVideoStore((state) => state.addTextsOnTL);
  const texts = useVideoStore((state) => state.texts);
  const deleteTextFromTL = useVideoStore((state) => state.deleteTextFromTL);
  const [loadingForConverintAllVideos, setLoadingForConvertingAllVideso] = useState(false);
  const audios = useVideoStore((state) => state.audios);
  const uploadAudio = useVideoStore((state) => state.addAudioOnTL);
  const deleteSpecificAudio = useVideoStore((state) => state.deleteSpecificAudio);
  const [openRecordingModal, setOpenRecordingModal] = useState(false);

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
          toggleMenu(null);
        };
        videos.forEach((vid) => {
          const individualVideo = document.querySelector(`div[data-id="${vid.id}"] > video`);
          if (individualVideo) individualVideo.currentTime = 0;
        });
        reader.readAsArrayBuffer(file);
      }
    },
    [addVideo]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const exportAllVideos = async () => {
    try {
      const formData = new FormData();

      const normalizedVideos = videos
        .map((video) => ({
          ...video,
          startTime: parseFloat(video.startTime),
          endTime: parseFloat(video.endTime),
          duration: parseFloat(video.duration),
        }))
        .sort((a, b) => a.startTime - b.startTime);

      for (const video of normalizedVideos) {
        const response = await fetch(video.src);
        const blobData = await response.blob();
        const file = new File([blobData], `${video.id}.mp4`, { type: "video/mp4" });
        formData.append("videos", file);
      }

      const normalizedImages = images.map((image) => ({
        ...image,
        startTime: parseFloat(image.startTime),
        endTime: parseFloat(image.endTime),
        x: parseInt(image.x),
        y: parseInt(image.y),
        width: parseInt(image.width),
        height: parseInt(image.height),
        opacity: parseInt(image.opacity),
      }));

      for (const image of normalizedImages) {
        const response = await fetch(image.src);
        const blobData = await response.blob();
        const file = new File([blobData], `${image.id}.png`, { type: "image/png" });
        formData.append("images", file);
      }

      const normalizedTexts = texts.map((text) => ({
        ...text,
        startTime: parseFloat(text.startTime),
        endTime: parseFloat(text.endTime),
        x: parseInt(text.x),
        y: parseInt(text.y),
        fontSize: parseInt(text.fontSize),
        opacity: parseInt(text.opacity),
      }));

      formData.append(
        "metadata",
        JSON.stringify({
          videos: normalizedVideos,
          images: normalizedImages,
          texts: normalizedTexts,
        })
      );
      formData.append("canvas_width", window.innerWidth.toString());
      formData.append("canvas_height", "680".toString());
      setLoadingForConvertingAllVideso(true);
      const response = await fetch("http://127.0.0.1:8000/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        toast({
          title: "Someting went wrong in encoding the video",
        });
      }
      setLoadingForConvertingAllVideso(false);
      const finalVideo = await response.blob();
      const url = URL.createObjectURL(finalVideo);
      const a = document.createElement("a");
      a.href = url;
      a.download = "final_video.mp4";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setLoadingForConvertingAllVideso(false);
      toast({
        title: "Someting went wrong in encoding the video",
      });
      console.log(e, "err");
    }
  };
  return (
    <div className="fixed bg-black left-4 z-[4] top-[37%] transform -translate-y-1/2" ref={menuRef}>
      <TooltipProvider>
        <div className="bg-background rounded-lg shadow-lg flex flex-col space-y-1 p-2">
          <MenuButton icon={<Video className="h-5 w-5" />} tooltip="Upload Video" onClick={() => toggleMenu("video")} />
          <MenuButton icon={<Type className="h-5 w-5" />} tooltip="Add Text" onClick={() => toggleMenu("text")} />
          <MenuButton icon={<Image className="h-5 w-5" />} tooltip="Upload Photo" onClick={() => toggleMenu("photo")} />
          <MenuButton
            icon={<Music className="h-5 w-5" />}
            tooltip="Upload/Record audio"
            onClick={() => toggleMenu("audio")}
          />
          <MenuButton
            icon={<Download className="h-5 w-5" />}
            tooltip="Export and download"
            onClick={() => toggleMenu("export")}
          />
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
                      <div className="flex flex-col h-full ">
                        <div className="relative flex w-full justify-end">
                          <X
                            onClick={() => {
                              deleteVideo(video.id);
                            }}
                            className="absolute bg-black pointer-events-auto z-[1] cursor-pointer p-[1px] text-white rounded-full border border-gray-400"
                            size={20}
                          />
                        </div>
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
            <Tabs defaultValue="upload-new" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="upload-new" className="flex-1">
                  Upload New
                </TabsTrigger>
                <TabsTrigger value="your-media" className="flex-1">
                  Your Media
                </TabsTrigger>
              </TabsList>
              <TabsContent value="your-media" className="mt-0">
                <div className="flex flex-wrap gap-5 ustify-start mx-auto max-h-[240px] overflow-y-auto pr-2">
                  {images.length === 0 && (
                    <div className="w-full text-center text-muted-foreground py-4">No images added</div>
                  )}
                  {images.map((item, index) => (
                    <div key={index} className="flex flex-col h-full ">
                      <div className="relative flex w-full justify-end">
                        <X
                          onClick={() => {
                            deleteImageFromTL(item.id);
                          }}
                          className="absolute bg-black pointer-events-auto z-[1] cursor-pointer p-[1px] text-white rounded-full border border-gray-400"
                          size={20}
                        />
                      </div>
                      <div
                        key={index}
                        className="w-16 h-16 rounded-lg bg-accent/50 border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
                      >
                        <img src={item.src} className="w-16 h-16 rounded-md" />
                      </div>
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
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (
                        !addImageOnTL(file, {
                          width: window.innerWidth - 100,
                          height: window.innerHeight - 100,
                        })
                      ) {
                        toast({
                          title: "Image size must be less than 2MB",
                        });
                        return;
                      }
                      toggleMenu(null);
                    }}
                  />
                </Label>
              </TabsContent>
            </Tabs>
          </MenuContent>
        )}

        {openMenu === "text" && (
          <MenuContent key={3}>
            <Tabs defaultValue="add-text" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="add-text" className="flex-1">
                  Add Text
                </TabsTrigger>
                <TabsTrigger value="your-texts" className="flex-1">
                  Your Texts
                </TabsTrigger>
              </TabsList>
              <TabsContent value="add-text" className="mt-0">
                <div className="flex justify-center gap-4 flex-col h-28">
                  <Input
                    placeholder="Enter your text"
                    className="h-9"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (text.trim() === "") {
                          toast({
                            title: "Text cannot be empty",
                            duration: 2000,
                          });
                        } else {
                          addTextsOnTL(text, false, {
                            width: window.innerWidth - 100,
                            height: window.innerHeight - 100,
                          });
                          setText("");
                          toggleMenu(null);
                        }
                      }
                    }}
                    ref={(el) => el && el.focus()}
                  />
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (text.trim() === "") {
                        toast({
                          title: "Text cannot be empty",
                          duration: 2000,
                        });
                      } else {
                        addTextsOnTL(text, false, {
                          width: window.innerWidth - 100,
                          height: window.innerHeight - 100,
                        });
                        setText("");
                        toggleMenu(null);
                      }
                    }}
                  >
                    Add Text
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="your-texts" className="mt-0">
                <div className="flex flex-wrap gap-3 justify-start mx-auto max-h-[240px] overflow-y-auto pr-2">
                  {texts.length === 0 ? (
                    <div className="w-full text-center text-muted-foreground py-4">No texts added</div>
                  ) : (
                    texts.map((text, index) => (
                      <div key={index} className="flex w-full h-full items-center gap-4">
                        <div className="bg-accent/20 rounded-md border border-gray-600 p-2 text-sm break-all w-[94%]">
                          {text.description}
                        </div>
                        <div className="relative">
                          <X
                            onClick={() => {
                              deleteTextFromTL(text.id);
                            }}
                            className=" bg-black pointer-events-auto z-[1] cursor-pointer p-[1px] text-white rounded-full border border-gray-400"
                            size={20}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </MenuContent>
        )}

        {openMenu === "audio" && (
          <MenuContent key={3}>
            <Tabs defaultValue="upload-new" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="upload-new" className="flex-1">
                  Upload New
                </TabsTrigger>
                <TabsTrigger value="your-media" className="flex-1">
                  Your Media
                </TabsTrigger>
                <TabsTrigger value="record" className="flex-1">
                  Record Live Audio
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload-new" className="mt-0">
                <Label
                  htmlFor="audio-upload"
                  className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <span>Upload Audio</span>
                  </div>
                  <Input
                    id="audio-upload"
                    type="file"
                    accept=".mp3,.wav,.ogg,.m4a,.aac"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const audio = new Audio();
                        const url = URL.createObjectURL(file);
                        audio.src = url;

                        audio.onloadedmetadata = () => {
                          const duration = audio.duration;
                          if (duration > 600) {
                            // 10 minutes in seconds
                            toast({
                              title: "Audio duration should be less than 10 minutes",
                            });
                            return;
                          }

                          uploadAudio({
                            src: url,
                            duration,
                            endTime: duration,
                          });
                        };
                      }
                      toggleMenu(null);
                    }}
                  />
                </Label>
              </TabsContent>

              <TabsContent value="your-media" className="mt-0">
                <div className="flex flex-wrap gap-5 justify-start mx-auto max-h-[240px] overflow-y-auto pr-2">
                  {audios.length === 0 && (
                    <div className="w-full text-center text-muted-foreground py-4">No audio files added</div>
                  )}
                  {audios.map((audio, index) => (
                    <div key={index} className="flex flex-col h-full">
                      <div className="relative flex w-full justify-end">
                        <X
                          onClick={() => deleteSpecificAudio(audio.id)}
                          className="absolute bg-black pointer-events-auto z-[1] cursor-pointer p-[1px] text-white rounded-full border border-gray-400"
                          size={20}
                        />
                      </div>
                      <div className="w-16 h-16 rounded-lg bg-accent/50 border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                        <Music className="w-6 h-6 text-muted-foreground" />
                      </div>
                        <p className="text-xs text-gray-500 text-center">Audio {index + 1}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="record" className="mt-4">
                <Button
                  onClick={() => {
                    setOpenMenu("");
                    setOpenRecordingModal(true);
                  }}
                  className="w-full"
                >
                  Record Audio <Mic className="!w-5 !h-5" />{" "}
                </Button>
              </TabsContent>
            </Tabs>
          </MenuContent>
        )}

        {openMenu === "export" && (
          <MenuContent key={3}>
            <p className="text-xl font-semibold mb-5 mt-2">Export and download</p>
            <Button disabled={true} className="w-full" onClick={exportAllVideos}>
              {loadingForConverintAllVideos ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="animate-spin flex-shrink-0 !w-8 !h-6" />
                  can take 15 seconds
                </div>
              ) : (
                "Export"
              )}
            </Button>

            <p className="text-sm text-gray-300 my-4 w-[250px]">
              Export temporarily disabled: After a surge in traffic from the demo video, server costs became
              unsustainable. The backend implementation with FFMPEG is 100% functional, Check out the backend code on{" "}
              <Link
                href="https://github.com/Govind783/nextjs-video-editor"
                target="_blank"
                className="inline-flex items-center hover:text-white"
              >
                GitHub <Github className="ml-1" size={16} />
              </Link>
            </p>
          </MenuContent>
        )}
      </TooltipProvider>
      <RecordAudioModal isOpen={openRecordingModal} setIsOpen={setOpenRecordingModal} />
    </div>
  );
});
LeftPanel.displayName = "LeftPanel";

export default LeftPanel;

const MenuButton = memo(({ icon, tooltip, onClick }) => {
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
});
MenuButton.displayName = "MenuButton";

const MenuContent = memo(({ children }) => {
  return (
    <div className="absolute bg-black left-full ml-7 top-0 min-w-72 w-fit bg-background border border-gray-500 rounded-lg shadow-lg p-4 transition-all ease-out duration-300 transform translate-y-0 opacity-100 animate-slide-up">
      {children}
    </div>
  );
});
MenuContent.displayName = "MenuContent";

const RecordAudioModal = memo(({ isOpen, setIsOpen }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger></DialogTrigger>
      <DialogContent className='!max-w-[50rem]'>
        <DialogHeader>
          <DialogTitle>Record live audio</DialogTitle>
          <DialogDescription>
            <div>Please give the mic permission when prompted</div>
            <RecordAudio setIsOpen={setIsOpen} />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
});
RecordAudioModal.displayName = "RecordAudioModal";
