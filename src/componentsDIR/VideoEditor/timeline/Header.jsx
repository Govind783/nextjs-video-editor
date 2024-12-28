import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
// import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Undo, Redo, Clock, ZoomIn, ZoomOut } from "lucide-react";
import { useVideoStore } from "@/State/store";
import { formatTime, formatTimelineUnit } from "@/helpers/formatTime";
// import { debounce, throttle } from "lodash";

const TimeDisplay = memo(() => {
  const currentTime = useVideoStore((state) => state.currentTime);
  const duration = useVideoStore((state) => state.duration);

  return (
    <span className="text-sm tabular-nums transition-all ease-linear duration-150">
      {formatTimelineUnit(currentTime)} / {formatTime(duration)}
    </span>
  );
});
TimeDisplay.displayName = "TimeDisplay";

// const ZoomControls = memo(() => {
//   const scale = useVideoStore((state) => state.scale);
//   const setScale = useVideoStore((state) => state.setScale);

//   const handleZoom = (direction) => {
//     const ZOOM_STEP = 0.2;
//     const newZoom = direction === "in"
//       ? scale.zoom * (1 + ZOOM_STEP)
//       : scale.zoom * (1 - ZOOM_STEP);

//       setScale({
//         ...scale,
//         zoom: Math.max(0.002, Math.min(0.01, newZoom))
//       });

//     // const ZOOM_STEP = 0.1;
//     // const newZoom = direction === "in" ? scale.zoom * (1 + ZOOM_STEP) : scale.zoom * (1 - ZOOM_STEP);
//     // setScale({ ...scale, zoom: Math.max(0.1, Math.min(2, newZoom)) });
//   };

//   const debouncedSetScale = useMemo(() => debounce((value) => setScale({ ...scale, zoom: value / 60000 }), 8), [scale]);

//   return (
//     <div className="flex items-center space-x-2">
//       <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleZoom("out")}>
//         <ZoomOut className="w-4 h-4" />
//       </Button>

//       <Slider
//       value={[scale.zoom * 60000]}
//       min={1200}  // Smaller minimum
//       max={6000}  // Smaller maximum
//       step={100}
//         className="w-32"
//         onValueChange={([value]) => {
//           debouncedSetScale(value);
//         }}
//       />

//       <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleZoom("in")}>
//         <ZoomIn className="w-4 h-4" />
//       </Button>
//     </div>
//   );
// });
// ZoomControls.displayName = "ZoomControls";

const Header = memo(() => {
  const playerRef = useVideoStore((state) => state.playerRef);
  const currentVideoId = useVideoStore((state) => state.currentVideoId);
  const videos = useVideoStore((state) => state.videos);
  // const toggleVideoPlayback = useVideoStore((state) => state.toggleVideoPlayback);
  const toggleVideoPlayback = useVideoStore((state) => state.toggleVideoPlayback);

  const handlePlayPause = () => {
    const videoElements = document.querySelectorAll("video");
    const shouldPlay = !videos[0]?.isPlaying;

    videoElements.forEach((videoEl, index) => {
      //  play if the video hasn't reached its end
      if (shouldPlay) {
        //  if video hasn't reached its end before playing
        if (videoEl.currentTime < videoEl.duration) {
          videoEl.play();
        }
      } else {
        videoEl.pause();
      }
    });

    toggleVideoPlayback();
  };

  // const currentVideo = videos.find((video) => video.id === currentVideoId);

  return (
    <div className="flex items-center justify-center h-12 gap-20">
      {/* <div className="flex items-center space-x-2 px-12 min-w-[240px]">
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <Redo className="w-4 h-4" />
        </Button>
      </div> */}

      <div className="flex items-center justify-center relative ">
        <div className="flex items-center space-x-2">
          <div className="w-px h-4 bg-border" />
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handlePlayPause}>
            {videos[0]?.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          {/* <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handlePlayPause}>
            {currentVideo?.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button> */}
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <SkipForward className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-border" />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <TimeDisplay />
        </div>
        {/* <ZoomControls /> */}
      </div>
    </div>
  );
});
Header.displayName = "Header";

export default Header;
