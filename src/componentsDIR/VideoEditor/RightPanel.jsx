import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HexColorPicker } from "react-colorful";
import { Separator } from "@/components/ui/separator";
import { memo, useCallback, useEffect, useState } from "react";
import { useVideoStore } from "@/State/store";
import {
  Blend,
  Bold,
  Circle,
  CircleOff,
  Contrast,
  Image,
  Music,
  Sun,
  Type,
  Underline,
  Video,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const RightPanel = memo(() => {
  const selectedTextId = useVideoStore((state) => state.selectedTextId);
  const selectedVideoId = useVideoStore((state) => state.isVideoSelected);
  const updateTextStyle = useVideoStore((state) => state.updateTextStyle);
  const updateVideoSpeed = useVideoStore((state) => state.updateVideoSpeed);
  const updateVideoVolume = useVideoStore((state) => state.updateVideoVolume);
  const texts = useVideoStore((state) => state.texts);
  const selectedImageId = useVideoStore((state) => state.selectedImageId);
  const updateImageStyle = useVideoStore((state) => state.updateImageStyle)
  const selectedAudioID = useVideoStore((state) => state.selectedAudioID);

  const [isTextDrawerOpen, setIsTextDrawerOpen] = useState(false);
  const [isVideoDrawerOpen, setIsVideoDrawerOpen] = useState(false);
  const [isImagesDrawerOpen, setIsImagesDrawerOpen] = useState(false);
  const [isAudiosDrawerOpen, setIsAudiosDrawerOpen] = useState(false);

  // Get current text and video states
  const selectedText = useVideoStore((state) => state.texts.find((t) => t.id === selectedTextId));
  const selectedVideo = useVideoStore((state) => state.videos.find((v) => v.id === selectedVideoId));
  const selectedImage = useVideoStore((state) => state.images.find((i) => i.id === selectedImageId));
  
  const selectedAudioObjectBasedOnID = useVideoStore((state) => state.audios.find((av) => av.id === selectedAudioID))

  // Initialize states from store values
  const [showBg, setShowBg] = useState(selectedText?.backgroundColor !== undefined);
  const [bgColor, setBgColor] = useState(selectedText?.backgroundColor || "#000000");
  const [textColor, setTextColor] = useState(selectedText?.color || "#FFFFFF");
  const [showControls, setShowControls] = useState({
    grayScale: false,
    blur: false,
    contrast: false,
    brightness: false,
  });
  const audios = useVideoStore((state) => state.audios);
  
  const updateAudioSpeed = useVideoStore((state) => state.updateAudioSpeed);
  const updateAudioVolume = useVideoStore((state) => state.updateAudioVolume);

  useEffect(() => {
    if (selectedText) {
      setShowBg(selectedText.backgroundColor !== undefined);
      setBgColor(selectedText.backgroundColor || "#000000");
      setTextColor(selectedText.color);
    }
    // Reset drawer states when selection changes
  }, [selectedTextId, selectedVideoId]);

  useEffect(() => {
    setIsTextDrawerOpen((selectedTextId && isTextDrawerOpen) ?? false);
    setIsVideoDrawerOpen((selectedVideo && isVideoDrawerOpen) ?? false);
    setIsImagesDrawerOpen((selectedImageId && isImagesDrawerOpen) ?? false);
    setIsAudiosDrawerOpen((selectedAudioID && isAudiosDrawerOpen) ?? false)
  }, [selectedTextId, selectedVideo, selectedImageId, selectedAudioID]);

  // Video control handlers
  const handleSpeedChange = useCallback(
    (speed) => {
      if (selectedVideoId) {
        updateVideoSpeed(selectedVideoId, speed);
      }
    },
    [selectedVideoId, updateVideoSpeed]
  );

  const handleVolumeChange = useCallback(
    (value) => {
      if (selectedVideoId) {
        updateVideoVolume(selectedVideoId, value[0]);
      }
    },
    [selectedVideoId, updateVideoVolume]
  );

  // Text control handlers
  const handleFontStyleToggle = useCallback(
    (value) => {
      if (!selectedTextId) return;

      const styles = {
        bold: value.includes("bold") ? "bold" : "normal",
        italic: value.includes("italic"),
        underline: value.includes("underline"),
      };

      updateTextStyle(selectedTextId, {
        fontWeight: styles.bold,
        isItalic: styles.italic,
        isUnderline: styles.underline,
      });
    },
    [selectedTextId, updateTextStyle]
  );

  const handleFontSizeChange = useCallback(
    (value, accessedBy) => {
      if (selectedTextId) {
        updateTextStyle(selectedTextId, { [accessedBy]: value[0] });
      }
    },
    [selectedTextId, updateTextStyle]
  );

  const handleBackgroundToggle = useCallback(
    (checked) => {
      setShowBg(checked);
      if (selectedTextId) {
        updateTextStyle(selectedTextId, {
          backgroundColor: checked ? bgColor : undefined,
        });
      }
    },
    [selectedTextId, bgColor, updateTextStyle]
  );

  const handleBgColorChange = useCallback(
    (color) => {
      setBgColor(color);
      if (selectedTextId && showBg) {
        updateTextStyle(selectedTextId, { backgroundColor: color });
      }
    },
    [selectedTextId, showBg, updateTextStyle]
  );

  const handleTextColorChange = useCallback(
    (color) => {
      setTextColor(color);
      if (selectedTextId) {
        updateTextStyle(selectedTextId, { color });
      }
    },
    [selectedTextId, updateTextStyle]
  );

  const handleOpacityChange = useCallback(
    (value) => {
      if (selectedTextId) {
        updateTextStyle(selectedTextId, { opacity: value[0] });
      }
    },
    [selectedTextId, updateTextStyle]
  );

  const preventDrawerClose = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleVideoClick = (e) => {
    e.stopPropagation();
    setIsVideoDrawerOpen(true);
  };

  const toggleControl = (styleKEY) => {
    setShowControls((prev) => {
      return {
        ...prev,
        [styleKEY]: !prev[styleKEY],
      };
    });
    updateImageStyle(selectedImageId, {
      [styleKEY]: !showControls[styleKEY],
    });
  };

  // Create handlers like the video ones:
  const handleAudioSpeedChange = useCallback(
    (speed) => {
      if (selectedAudioID) {
        updateAudioSpeed(selectedAudioID, speed);
      }
    },
    [selectedAudioID, updateAudioSpeed]
  );

  const handleAudioVolumeChange = useCallback(
    (value) => {
      if (selectedAudioID) {
        updateAudioVolume(selectedAudioID, value[0]);
      }
    },
    [selectedAudioID, updateAudioVolume]
  );



  if (!(selectedTextId || selectedVideoId || selectedImageId || selectedAudioID)) return null;

  return (
    <div className="">
      <Sheet open={isTextDrawerOpen || isVideoDrawerOpen || isImagesDrawerOpen || isAudiosDrawerOpen} modal={false}>
        <SheetTrigger className="fixed left-4 z-10 top-4 flex flex-col gap-4">
          {selectedVideoId && (
            <div className="">
              <MenuButton icon={<Video className="h-6 w-6" />} onClick={handleVideoClick} tooltip={"Video Settings"} />
            </div>
          )}
          {selectedImageId && (
            <MenuButton
              icon={<Image className="h-6 w-6" />}
              onClick={(e) => {
                e.stopPropagation();
                setIsImagesDrawerOpen(true);
              }}
              tooltip={"Image settings"}
            />
          )}
          {selectedTextId && texts.length > 0 && (
            <MenuButton
              icon={<Type className="h-6 w-6" />}
              onClick={(e) => {
                e.stopPropagation();
                setIsTextDrawerOpen(true); //
              }}
              tooltip={"Text Settings"}
            />
          )}
          {selectedAudioID && (
            <MenuButton
              icon={<Music className="h-6 w-6" />}
              onClick={(e) => {
                e.stopPropagation();
                setIsAudiosDrawerOpen(true); //
              }}
              tooltip={"Audio Settings"}
            />
          )}
        </SheetTrigger>
        <SheetContent
          onClick={preventDrawerClose}
          className=" noScrollbar overflow-y-auto !p-[1.2rem] sm:max-w-[31rem] border-l-gray-600"
        >
          <SheetHeader>
            <SheetTitle></SheetTitle>
            <SheetDescription className="">
              {selectedVideoId && (
                <>
                  <p className="text-xl font-bold">Video Settings</p>
                  {/* <div>Adjust video playback settings here.</div> */}
                  <div className=" pb-0 mt-5">
                    <div className="space-y-10">
                      <div>
                        <h4 className="text-lg font-medium mb-4">Playback Speed</h4>
                        <div className="flex flex-wrap gap-3">
                          {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => handleSpeedChange(speed)}
                              className={`px-4 py-2 border border-gray-700 text-sm font-medium rounded-full transition-colors ${
                                speed === selectedVideo.speed
                                  ? "bg-white text-black"
                                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium mb-4">Volume</h4>
                        <div className="flex items-center space-x-6">
                          <Volume2 className="h-6 w-6 text-muted-foreground" />
                          <Slider
                            value={[selectedVideo.volume]}
                            onValueChange={handleVolumeChange}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {isTextDrawerOpen && (
                <>
                  {/* <p className="text-xl font-bold">Text Settings</p> */}
                  <div>
                    {/* <p>Customize text appearance here.</p> */}
                    <div className="pb-0" onClick={preventDrawerClose}>
                      <div className="flex flex-col h-[88vh] overflow-y-auto gap-9">
                        <Section title="Font Properties">
                          <div className="space-y-10">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Font Style</label>
                              <ToggleGroup
                                type="multiple"
                                className="justify-start space-x-2"
                                value={[
                                  selectedText?.fontWeight === "bold" && "bold",
                                  selectedText?.isItalic && "italic",
                                  selectedText?.isUnderline && "underline",
                                ].filter(Boolean)}
                                onValueChange={handleFontStyleToggle}
                              >
                                {[
                                  { value: "bold", icon: Bold },
                                  // { value: "italic", icon: Italic },
                                  { value: "underline", icon: Underline },
                                ].map(({ value, icon: Icon }) => (
                                  <ToggleGroupItem
                                    key={value}
                                    value={value}
                                    aria-label={`Toggle ${value}`}
                                    className="w-10 h-10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                  >
                                    <Icon className="h-5 w-5" />
                                  </ToggleGroupItem>
                                ))}
                              </ToggleGroup>
                            </div>

                            <div>
                              <label htmlFor="font-size" className="text-sm font-medium mb-2 block">
                                Font Size
                              </label>
                              <div className="flex items-center space-x-4">
                                <Slider
                                  id="font-size"
                                  value={[selectedText?.fontSize]}
                                  onValueChange={(e) => {
                                    handleFontSizeChange(e, "fontSize");
                                  }}
                                  max={300}
                                  min={8}
                                  step={1}
                                  className="flex-grow"
                                />
                                <span className="text-sm font-medium w-8 text-center">{selectedText?.fontSize}px</span>
                              </div>
                            </div>
                          </div>
                        </Section>

                        <Section title="Colors">
                          <div className="space-y-16">
                            <div className="flex items-center gap-6">
                              <Switch id="show-bg" checked={showBg} onCheckedChange={handleBackgroundToggle} />
                              <label htmlFor="show-bg" className="text-sm font-medium">
                                Enable background color
                              </label>
                            </div>
                            <div className="flex items-center gap-6">
                              {
                                <div onClick={(e) => e.stopPropagation()} className="pl-4">
                                  <label className="text-sm font-medium mb-2 block underline">Background Color</label>
                                  <HexColorPicker
                                    color={bgColor}
                                    onChange={handleBgColorChange}
                                    className="w-full max-w-[200px]"
                                  />
                                </div>
                              }
                              <div onClick={(e) => e.stopPropagation()} className="pl-4">
                                <label className="text-sm font-medium mb-2 block underline">Text Color</label>
                                <HexColorPicker
                                  color={textColor}
                                  onChange={handleTextColorChange}
                                  className="w-full max-w-[200px]"
                                />
                              </div>
                            </div>
                          </div>
                        </Section>

                        <Section title="Opacity">
                          <div className="space-y-4 pb-4 pr-4">
                            <div className="flex items-center space-x-4">
                              <Slider
                                id="opacity"
                                value={[selectedText?.opacity]}
                                onValueChange={handleOpacityChange}
                                max={100}
                                step={1}
                                className="flex-grow"
                              />
                              <span className="text-sm font-medium w-8 text-center">{selectedText?.opacity}%</span>
                            </div>
                          </div>
                        </Section>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {isImagesDrawerOpen && (
                <>
                  <p className="text-xl font-bold">Image Settings</p>
                  <div className="mt-5">
                    <div onClick={preventDrawerClose} className="pb-0">
                      <div className="space-y-16">
                        <div>
                          <div className="flex items-center  mb-4 gap-2">
                            <h4 className="text-lg font-medium">Border radius</h4>
                            <Circle className="h-6 w-6 text-muted-foreground rounded-full" />
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {selectedImage?.borderRadius}px
                            <Slider
                              value={[selectedImage?.borderRadius]}
                              onValueChange={(e) => {
                                updateImageStyle(selectedImageId, {
                                  borderRadius: e[0],
                                });
                              }}
                              max={30}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center  mb-4 gap-2">
                            <h4 className="text-lg font-medium">Opacity</h4>
                            <Blend className="h-6 w-6 text-muted-foreground" />
                          </div>
                          {selectedImage?.opacity}px
                          <div className="flex items-center space-x-6">
                            <Slider
                              value={[selectedImage?.opacity]}
                              onValueChange={(e) => {
                                updateImageStyle(selectedImageId, {
                                  opacity: e[0],
                                });
                              }}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* Grayscale Control */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-medium">Grayscale</h4>
                              <CircleOff className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <Switch
                              checked={showControls.grayScale}
                              onCheckedChange={() => toggleControl("grayScale")}
                            />
                          </div>
                          {showControls.grayScale && (
                            <div className="flex flex-wrap gap-3">
                              <span>{selectedImage?.grayScaleValue || 0}%</span>
                              <Slider
                                value={[selectedImage?.grayScaleValue || 0]}
                                onValueChange={(e) => {
                                  updateImageStyle(selectedImageId, {
                                    grayScale: true,
                                    grayScaleValue: e[0],
                                  });
                                }}
                                max={100}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>

                        {/* Blur Control */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-medium">Blur</h4>
                              <Blend className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <Switch checked={showControls.blur} onCheckedChange={() => toggleControl("blur")} />
                          </div>
                          {showControls.blur && (
                            <div className="flex flex-wrap gap-3">
                              <span>{selectedImage?.blurValue || 0}px</span>
                              <Slider
                                value={[selectedImage?.blurValue || 0]}
                                onValueChange={(e) => {
                                  updateImageStyle(selectedImageId, {
                                    blur: true,
                                    blurValue: e[0],
                                  });
                                }}
                                max={10}
                                step={0.1}
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>

                        {/* Contrast Control */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-medium">Contrast</h4>
                              <Contrast className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <Switch checked={showControls.contrast} onCheckedChange={() => toggleControl("contrast")} />
                          </div>
                          {showControls.contrast && (
                            <div className="flex flex-wrap gap-3">
                              <span>{selectedImage?.contrastValue || 1}x</span>
                              <Slider
                                value={[selectedImage?.contrastValue || 1]}
                                onValueChange={(e) => {
                                  updateImageStyle(selectedImageId, {
                                    contrast: true,
                                    contrastValue: e[0],
                                  });
                                }}
                                min={0}
                                max={2}
                                step={0.1}
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>

                        {/* Brightness Control */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-medium">Brightness</h4>
                              <Sun className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <Switch
                              checked={showControls.brightness}
                              onCheckedChange={() => toggleControl("brightness")}
                            />
                          </div>
                          {showControls.brightness && (
                            <div className="flex flex-wrap gap-3">
                              <span>{selectedImage?.brightnessValue || 1}x</span>
                              <Slider
                                value={[selectedImage?.brightnessValue || 1]}
                                onValueChange={(e) => {
                                  updateImageStyle(selectedImageId, {
                                    brightness: true,
                                    brightnessValue: e[0],
                                  });
                                }}
                                min={0}
                                max={2}
                                step={0.1}
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {selectedAudioID && (
                <>
                  <p className="text-xl font-bold">Audio Settings</p>
                  {/* <div>Adjust video playback settings here.</div> */}
                  <div className=" pb-0 mt-5">
                    <div className="space-y-10">
                      <div>
                        <h4 className="text-lg font-medium mb-4">Playback Speed</h4>
                        <div className="flex flex-wrap gap-3">
                          {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => handleAudioSpeedChange(speed)}
                              className={`px-4 py-2 border border-gray-700 text-sm font-medium rounded-full transition-colors ${
                                speed === selectedAudioObjectBasedOnID?.speed
                                  ? "bg-white text-black"
                                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium mb-4">Volume</h4>
                        <div className="flex items-center space-x-6">
                          <Volume2 className="h-6 w-6 text-muted-foreground" />
                          <Slider
                            value={[selectedAudioObjectBasedOnID?.volume || 11]}
                            onValueChange={handleAudioVolumeChange}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
});

export default RightPanel;
RightPanel.displayName = "RightPanel";

const MenuButton = memo(({ icon, tooltip, onClick }) => {
  return (
    <TooltipProvider className="">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={onClick}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-background border !border-gray-700 relative left-2">
          <p className="text-sm font-medium">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
MenuButton.displayName = "MenuButton";

const Section = memo(({ title, children }) => {
  const preventDrawerClose = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };
  return (
    <div className="space-y-4" onClick={preventDrawerClose}>
      <h4 className="text-lg font-semibold">{title}</h4>
      <Separator className="my-7 !bg-gray-600 rounded-full" />
      {children}
    </div>
  );
});
Section.displayName = "Section";
