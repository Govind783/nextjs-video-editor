import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HexColorPicker } from "react-colorful";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/CustomDrawer";
import { memo, useCallback, useEffect, useState } from "react";
import { useVideoStore } from "@/State/store";
import { Bold, Italic, Type, Underline, Video, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const RightPanel = memo(() => {
  const selectedTextId = useVideoStore((state) => state.selectedTextId);
  const isVideoSelected = useVideoStore((state) => state.isVideoSelected);
  const updateTextStyle = useVideoStore((state) => state.updateTextStyle);
  const updateVideoSpeed = useVideoStore((state) => state.updateVideoSpeed);
  const updateVideoVolume = useVideoStore((state) => state.updateVideoVolume);

  const [isTextDrawerOpen, setIsTextDrawerOpen] = useState(false);
  const [isVideoDrawerOpen, setIsVideoDrawerOpen] = useState(false);

  // Get current text and video states
  const selectedText = useVideoStore((state) => state.texts.find((t) => t.id === selectedTextId));
  const selectedVideo = useVideoStore((state) => state.videos.find((v) => v.id === isVideoSelected));

  // Initialize states from store values
  const [showBg, setShowBg] = useState(selectedText?.backgroundColor !== undefined);
  const [bgColor, setBgColor] = useState(selectedText?.backgroundColor || "#000000");
  const [textColor, setTextColor] = useState(selectedText?.color || "#FFFFFF");

  useEffect(() => {
    if (selectedText) {
      setShowBg(selectedText.backgroundColor !== undefined);
      setBgColor(selectedText.backgroundColor || "#000000");
      setTextColor(selectedText.color);
    }
    // Reset drawer states when selection changes
  }, [selectedTextId, isVideoSelected]);

  useEffect(() => {
    setIsTextDrawerOpen((selectedTextId && isTextDrawerOpen) ?? false);
    setIsVideoDrawerOpen((selectedVideo && isVideoDrawerOpen) ?? false);
  }, [selectedTextId, selectedVideo]);

  // Video control handlers
  const handleSpeedChange = useCallback(
    (speed) => {
      if (isVideoSelected) {
        updateVideoSpeed(isVideoSelected, speed);
      }
    },
    [isVideoSelected, updateVideoSpeed]
  );

  const handleVolumeChange = useCallback(
    (value) => {
      if (isVideoSelected) {
        updateVideoVolume(isVideoSelected, value[0]);
      }
    },
    [isVideoSelected, updateVideoVolume]
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
    (value) => {
      if (selectedTextId) {
        updateTextStyle(selectedTextId, { fontSize: value[0] });
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
    console.log("Video button clicked, current state:", isVideoDrawerOpen)
    setIsVideoDrawerOpen(true);
  };

  if (!(selectedTextId || isVideoSelected)) return null;

  return (
    <div className="fixed right-8 z-[4] top-[42%] transform -translate-y-1/2">
      <TooltipProvider>
        <div className="bg-background rounded-xl shadow-lg flex flex-col space-y-3 p-3">
          {isVideoSelected && (
            <>
              <MenuButton icon={<Video className="h-6 w-6" />} tooltip="Video settings" onClick={handleVideoClick} />
              {isVideoDrawerOpen && (
                <Drawer isOpen={isVideoDrawerOpen} setIsOpen={setIsVideoDrawerOpen}>
                  {/* <DrawerTrigger asChild></DrawerTrigger> */}
                  <DrawerContent className="bg-black h-[99vh] border-l border-gray-700  top-[-22rem]">
                    <DrawerHeader>
                      <DrawerTitle className="mt-8">Video Settings</DrawerTitle>
                      <DrawerDescription>Adjust video playback settings here.</DrawerDescription>
                    </DrawerHeader>
                    <div onClick={preventDrawerClose} className="p-4 pb-0">
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
                  </DrawerContent>
                </Drawer>
              )}
            </>
          )}
          {selectedTextId && (
            <>
              <MenuButton
                icon={<Type className="h-6 w-6" />}
                tooltip="Text settings"
                onClick={() => setIsTextDrawerOpen(true)}
              />
              {isTextDrawerOpen && (
                <Drawer isOpen={isTextDrawerOpen} setIsOpen={setIsTextDrawerOpen}>
                  {/* <DrawerTrigger asChild>
                  <MenuButton
                    icon={<Type className="h-6 w-6" />}
                    tooltip="Text settings"
                    onClick={() => toggleMenu("text")}
                  />
                </DrawerTrigger> */}
                  <DrawerContent className={`bg-black h-[99vh] border-l border-gray-700 top-[-22rem]`}>
                    <DrawerHeader>
                      <DrawerTitle>Text Settings</DrawerTitle>
                      <DrawerDescription>Customize text appearance here.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0" onClick={preventDrawerClose}>
                      <div className="flex flex-col h-[88vh] overflow-y-auto gap-9">
                        <Section title="Font Properties">
                          <div className="space-y-10">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Font Style</label>
                              <ToggleGroup
                                type="multiple"
                                className="justify-start space-x-2"
                                value={[
                                  selectedText.fontWeight === "bold" && "bold",
                                  selectedText.isItalic && "italic",
                                  selectedText.isUnderline && "underline",
                                ].filter(Boolean)}
                                onValueChange={handleFontStyleToggle}
                              >
                                {[
                                  { value: "bold", icon: Bold },
                                  { value: "italic", icon: Italic },
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
                                  value={[selectedText.fontSize]}
                                  onValueChange={handleFontSizeChange}
                                  max={32}
                                  min={8}
                                  step={1}
                                  className="flex-grow"
                                />
                                <span className="text-sm font-medium w-8 text-center">{selectedText.fontSize}px</span>
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
                                value={[selectedText.opacity]}
                                onValueChange={handleOpacityChange}
                                max={100}
                                step={1}
                                className="flex-grow"
                              />
                              <span className="text-sm font-medium w-8 text-center">{selectedText.opacity}%</span>
                            </div>
                          </div>
                        </Section>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              )}
            </>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
});

export default RightPanel;
RightPanel.displayName = "RightPanel";

const MenuButton = memo(({ icon, tooltip, onClick }) => {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          onClick={onClick}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="bg-background relative -top-4 border border-border">
        <p className="text-sm font-medium">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
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
