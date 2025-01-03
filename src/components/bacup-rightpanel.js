
// const RightPanel = memo(({ openMenu, setOpenMenu }) => {
//   const selectedTextId = useVideoStore((state) => state.selectedTextId);
//   const isVideoSelected = useVideoStore((state) => state.isVideoSelected);
//   const updateTextStyle = useVideoStore((state) => state.updateTextStyle);
//   const updateVideoSpeed = useVideoStore((state) => state.updateVideoSpeed);
//   const updateVideoVolume = useVideoStore((state) => state.updateVideoVolume);

//   // Get current text and video states
//   const selectedText = useVideoStore((state) => state.texts.find((t) => t.id === selectedTextId));
//   const selectedVideo = useVideoStore((state) => state.videos.find((v) => v.id === isVideoSelected));

//   // Initialize states from store values
//   const [showBg, setShowBg] = useState(selectedText?.backgroundColor !== undefined);
//   const [bgColor, setBgColor] = useState(selectedText?.backgroundColor || "#000000");
//   const [textColor, setTextColor] = useState(selectedText?.color || "#FFFFFF");

//   // Update local states when selected text changes
//   useEffect(() => {
//     if (selectedText) {
//       setShowBg(selectedText.backgroundColor !== undefined);
//       setBgColor(selectedText.backgroundColor || "#000000");
//       setTextColor(selectedText.color);
//     }
//   }, [selectedText]);

//   const toggleMenu = (menu, e) => {
//     e.stopPropagation();
//     e.preventDefault();
//     setOpenMenu(openMenu === menu ? null : menu);
//   };

//   // Video control handlers
//   const handleSpeedChange = useCallback(
//     (speed) => {
//       if (isVideoSelected) {
//         updateVideoSpeed(isVideoSelected, speed);
//       }
//     },
//     [isVideoSelected, updateVideoSpeed]
//   );

//   const handleVolumeChange = useCallback(
//     (value) => {
//       if (isVideoSelected) {
//         updateVideoVolume(isVideoSelected, value[0]);
//       }
//     },
//     [isVideoSelected, updateVideoVolume]
//   );

//   // Text control handlers
//   const handleFontStyleToggle = useCallback(
//     (value) => {
//       if (!selectedTextId) return;

//       const styles = {
//         bold: value.includes("bold") ? "bold" : "normal",
//         italic: value.includes("italic"),
//         underline: value.includes("underline"),
//       };

//       updateTextStyle(selectedTextId, {
//         fontWeight: styles.bold,
//         isItalic: styles.italic,
//         isUnderline: styles.underline,
//       });
//     },
//     [selectedTextId, updateTextStyle]
//   );

//   const handleFontSizeChange = useCallback(
//     (value) => {
//       if (selectedTextId) {
//         updateTextStyle(selectedTextId, { fontSize: value[0] });
//       }
//     },
//     [selectedTextId, updateTextStyle]
//   );

//   const handleBackgroundToggle = useCallback(
//     (checked) => {
//       setShowBg(checked);
//       if (selectedTextId) {
//         updateTextStyle(selectedTextId, {
//           backgroundColor: checked ? bgColor : undefined,
//         });
//       }
//     },
//     [selectedTextId, bgColor, updateTextStyle]
//   );

//   const handleBgColorChange = useCallback(
//     (color) => {
//       setBgColor(color);
//       if (selectedTextId && showBg) {
//         updateTextStyle(selectedTextId, { backgroundColor: color });
//       }
//     },
//     [selectedTextId, showBg, updateTextStyle]
//   );

//   const handleTextColorChange = useCallback(
//     (color) => {
//       setTextColor(color);
//       if (selectedTextId) {
//         updateTextStyle(selectedTextId, { color });
//       }
//     },
//     [selectedTextId, updateTextStyle]
//   );

//   const handleOpacityChange = useCallback(
//     (value) => {
//       if (selectedTextId) {
//         updateTextStyle(selectedTextId, { opacity: value[0] });
//       }
//     },
//     [selectedTextId, updateTextStyle]
//   );

//   if (!(selectedTextId || isVideoSelected)) return null;

//   return (
//     <div className="fixed right-8 z-[4] top-[42%] transform -translate-y-1/2">
//       <TooltipProvider>
//         <div className="bg-background rounded-xl shadow-lg flex flex-col space-y-3 p-3">
//           {isVideoSelected && (
//             <MenuButton
//               icon={<Video className="h-6 w-6" />}
//               tooltip="Video settings"
//               onClick={(e) => toggleMenu("video", e)}
//             />
//           )}
//           {selectedTextId && (
//             <MenuButton
//               icon={<Type className="h-6 w-6" />}
//               tooltip="Text settings"
//               onClick={(e) => toggleMenu("text", e)}
//             />
//           )}
//         </div>

//         {openMenu === "video" && selectedVideo && (
//           <MenuContent>
//             <div className="space-y-10" onClick={(e) => e.stopPropagation()}>
//               <div>
//                 <h4 className="text-lg font-medium mb-4">Playback Speed</h4>
//                 <div className="flex flex-wrap gap-3">
//                   {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
//                     <button
//                       key={speed}
//                       onClick={() => handleSpeedChange(speed)}
//                       className={`px-4 py-2 border border-gray-700 text-sm font-medium rounded-full transition-colors ${
//                         speed === selectedVideo.speed
//                           ? "bg-primary text-primary-foreground"
//                           : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
//                       }`}
//                     >
//                       {speed}x
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <div>
//                 <h4 className="text-lg font-medium mb-4">Volume</h4>
//                 <div className="flex items-center space-x-6">
//                   <Volume2 className="h-6 w-6 text-muted-foreground" />
//                   <Slider
//                     value={[selectedVideo.volume]}
//                     onValueChange={handleVolumeChange}
//                     max={100}
//                     step={1}
//                     className="w-full"
//                   />
//                 </div>
//               </div>
//             </div>
//           </MenuContent>
//         )}

//         {openMenu === "text" && selectedText && (
//           <MenuContent>
//             <div onClick={(e)=> e.stopPropagation()} className="bg-black p-1 rounded-xl shadow-lg w-[900px] max-h-[380px] overflow-y-auto">
//               <div className="grid grid-cols-3 gap-20">
//                 <Section title="Font Properties">
//                   <div className="space-y-16">
//                     <div>
//                       <label className="text-sm font-medium mb-2 block">Font Style</label>
//                       <ToggleGroup
//                         type="multiple"
//                         className="justify-start space-x-2"
//                         value={[
//                           selectedText.fontWeight === "bold" && "bold",
//                           selectedText.isItalic && "italic",
//                           selectedText.isUnderline && "underline",
//                         ].filter(Boolean)}
//                         onValueChange={handleFontStyleToggle}
//                       >
//                         {[
//                           { value: "bold", icon: Bold },
//                           { value: "italic", icon: Italic },
//                           { value: "underline", icon: Underline },
//                         ].map(({ value, icon: Icon }) => (
//                           <ToggleGroupItem
//                             key={value}
//                             value={value}
//                             aria-label={`Toggle ${value}`}
//                             className="w-10 h-10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
//                           >
//                             <Icon className="h-5 w-5" />
//                           </ToggleGroupItem>
//                         ))}
//                       </ToggleGroup>
//                     </div>

//                     <div>
//                       <label htmlFor="font-size" className="text-sm font-medium mb-2 block">
//                         Font Size
//                       </label>
//                       <div className="flex items-center space-x-4">
//                         <Slider
//                           id="font-size"
//                           value={[selectedText.fontSize]}
//                           onValueChange={handleFontSizeChange}
//                           max={32}
//                           min={8}
//                           step={1}
//                           className="flex-grow"
//                         />
//                         <span className="text-sm font-medium w-8 text-center">{selectedText.fontSize}px</span>
//                       </div>
//                     </div>
//                   </div>
//                 </Section>

//                 <Section title="Colors">
//                   <div className="space-y-16">
//                     <div className="flex items-center gap-6">
//                       <Switch id="show-bg" checked={showBg} onCheckedChange={handleBackgroundToggle} />
//                       <label htmlFor="show-bg" className="text-sm font-medium">
//                         Show Background
//                       </label>
//                     </div>
//                     {showBg && (
//                       <div>
//                         <label className="text-sm font-medium mb-2 block underline">Background Color</label>
//                         <HexColorPicker
//                           color={bgColor}
//                           onChange={handleBgColorChange}
//                           className="w-full max-w-[200px]"
//                         />
//                         {/* <div className="mt-2 text-sm font-medium">{bgColor}</div> */}
//                       </div>
//                     )}
//                     <div>
//                       <label className="text-sm font-medium mb-2 block underline">Text Color</label>
//                       <HexColorPicker
//                         color={textColor}
//                         onChange={handleTextColorChange}
//                         className="w-full max-w-[200px]"
//                       />
//                       {/* <div className="mt-2 text-sm font-medium">{textColor}</div> */}
//                     </div>
//                   </div>
//                 </Section>

//                 <Section title="Opacity">
//                   <div className="space-y-4">
//                     <label htmlFor="opacity" className="text-sm font-medium mb-2 block">
//                       Opacity
//                     </label>
//                     <div className="flex items-center space-x-4">
//                       <Slider
//                         id="opacity"
//                         value={[selectedText.opacity]}
//                         onValueChange={handleOpacityChange}
//                         max={100}
//                         step={1}
//                         className="flex-grow"
//                       />
//                       <span className="text-sm font-medium w-8 text-center">{selectedText.opacity}%</span>
//                     </div>
//                   </div>
//                 </Section>
//               </div>
//             </div>
//           </MenuContent>
//         )}
//       </TooltipProvider>
//     </div>
//   );
// });
// export default RightPanel;
// RightPanel.displayName = "RightPanel";

// const MenuButton = memo(({ icon, tooltip, onClick }) => {
//   return (
//     <Tooltip delayDuration={0}>
//       <TooltipTrigger asChild>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="w-12 h-12 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
//           onClick={onClick}
//         >
//           {icon}
//         </Button>
//       </TooltipTrigger>
//       <TooltipContent side="left" className="bg-background relative -top-4 border border-border">
//         <p className="text-sm font-medium">{tooltip}</p>
//       </TooltipContent>
//     </Tooltip>
//   );
// });
// MenuButton.displayName = "MenuButton";

// const MenuContent = memo(({ children }) => {
//   return (
//     <div className="absolute bg-background right-full mr-6 -top-40 min-w-96 max-w-fit border border-gray-600 bg-black rounded-xl shadow-xl p-8 transition-all ease-out duration-300 transform translate-y-0 opacity-100 animate-slide-up">
//       {children}
//     </div>
//   );
// });
// MenuContent.displayName = "MenuContent";

// const Section = memo(({ title, children }) => {
//   return (
//     <div className="space-y-4">
//       <h4 className="text-lg font-semibold">{title}</h4>
//       <Separator className="my-7 !bg-gray-600 rounded-full" />
//       {children}
//     </div>
//   );
// });
// Section.displayName = "Section";