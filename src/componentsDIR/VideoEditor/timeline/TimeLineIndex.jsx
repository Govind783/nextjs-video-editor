import React, { useRef, useState, useEffect, useCallback } from "react";
import { useVideoStore } from "@/State/store";
import Header from "./Header";
import Ruler from "./Ruler";
import Playhead from "./TimeStampThumbnails";
import * as ScrollArea from "@radix-ui/react-scroll-area";

const TIMELINE_OFFSET_X = 40;
const TIMELINE_OFFSET_CANVAS_LEFT = 10;
const TIMELINE_OFFSET_RIGHT = 40;
const FPS = 60;

const colors = [
  "#0d1117",
  "#121620",
  "#161b2a",
  "#1a2033",
  "#1e253d",
  "#222a46",
  "#262f50",
  "#2a3459",
  "#2e3963",
  "#323e6c",
  "#364376",
  "#3a487f",
  "#3e4d89",
  "#425292",
  "#46579c",
  "#4a5ca5",
  "#4e61af",
  "#5266b8",
  "#566bc2",
  "#5a70cb",
];

const TimeLineIndex = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const horizontalScrollRef = useRef(null);
  // const isDragging = useVideoStore((state) => state.isDragging);
  const isVideoSelected = useVideoStore((state) => state.isVideoSelected);
  const setIsVideoSelected = useVideoStore((state) => state.setIsVideoSelected);
  const scale = useVideoStore((state) => state.scale);
  const videos = useVideoStore((state) => state.videos);

  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [duration, setDuratrion] = useState(0);
  const totalTimelineWidth = duration * FPS * scale.zoom * 60;
  const videoRegions = useRef([]);

  useEffect(() => {
    let maxDuartion = 0;
    for (let i = 0; i < videos.length; i++) {
      if (videos[i].duration > maxDuartion) {
        maxDuartion = videos[i].duration;
        setDuratrion(videos[i].duration);
      }
    }
  }, [videos.length]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.clientWidth);
        setCanvasWidth(Math.max(totalTimelineWidth, containerRef.current.clientWidth));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setViewportWidth(containerRef.current.clientWidth);
      setCanvasWidth(Math.max(totalTimelineWidth, containerRef.current.clientWidth));
    }
  }, [totalTimelineWidth]);

  const handleScroll = (event) => {
    const newScrollLeft = event.currentTarget.scrollLeft;
    setScrollLeft(newScrollLeft);

    if (canvasRef.current) {
      canvasRef.current.style.transform = `translateX(${-newScrollLeft}px)`;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = 230 * dpr;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    videoRegions.current = [];

    // video rectangle onm time TL
    videos.forEach((video, index) => {
      const startX = video.startTime * FPS * scale.zoom * 60 + 6; // the +6 is just for some minor gap between the play ahead pin and the start of our video
      const width = (video.endTime - video.startTime) * FPS * scale.zoom * 60;
      const height = 50;
      const y = index * (height + 10) + 40;

      videoRegions.current.push({
        id: video.id,
        bounds: {
          x: startX,
          y: y,
          width: width,
          height: height
        }
      });

      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.roundRect(startX, y, width, height, 4);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = video.id === isVideoSelected ? "white" : "#425292";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(startX, y, width, height, 4);
      ctx.stroke();

      // Draw text
      ctx.fillStyle = "#999";
      ctx.font = "15px sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(`▶ Video ${index + 1}`, startX + 25, y + height / 2);
    });
  }, [videos.length, scale.zoom, isVideoSelected, canvasWidth]);

  

  const handleCanvasClick = useCallback((e) => {
    e.stopPropagation();
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left - TIMELINE_OFFSET_CANVAS_LEFT) + scrollLeft;
  const y = e.clientY - rect.top;

  const clickedRegion = videoRegions.current.find(region => 
    x >= region.bounds.x && 
    x <= (region.bounds.x + region.bounds.width) &&
    y >= region.bounds.y && 
    y <= (region.bounds.y + region.bounds.height)
  );

  // If we clicked a region, select that video. Otherwise, deselect
  if (clickedRegion) {
    setIsVideoSelected(clickedRegion.id);
  } else {
    setIsVideoSelected(null);
  }
  }, [scrollLeft, videos.length]);


  
  return (
    <div className="relative min-h-60 max-h-fit w-full overflow-hidden bg-gray-900/50 border-t border-t-gray-700">
      <Header />
      <Ruler
        scrollLeft={scrollLeft}
        startTimeIN_Current_ViewPort={scrollLeft / (FPS * scale.zoom * 60)}
        lastTimeUnit_IN_CurreentViewPort={(scrollLeft + viewportWidth) / (FPS * scale.zoom * 60)}
      />
      <Playhead scrollLeft={scrollLeft} />

      <div className="flex">
        <div className="relative w-10 flex-none" />
        <div className="relative h-[230px] flex-1">
          <div className="absolute top-0 h-[230px] w-full" ref={containerRef}>
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              style={{
                position: "absolute",
                top: 0,
                left: TIMELINE_OFFSET_CANVAS_LEFT,
                width: `${canvasWidth}px`,
                height: "230px",
                willChange: "transform",
                zIndex: 2,
              }}
            />
          </div>

          <ScrollArea.Root
            type="always"
            style={{
              position: "absolute",
              width: "calc(100vw - 40px)",
              height: "20px",
            }}
            className="ScrollAreaRootH z-[3] mt-[12rem]"
          >
            <ScrollArea.Viewport
              className="ScrollAreaViewport"
              id="viewportH"
              onScroll={handleScroll}
              ref={horizontalScrollRef}
              style={{
                overflowX: "scroll",
                width: "100%",
                height: "100%",
                overflowY: "hidden",
              }}
            >
              <div
                style={{
                  width: `${canvasWidth + TIMELINE_OFFSET_RIGHT}px`,
                  height: "20px",
                }}
                className="pointer-events-none"
              />
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="horizontal" className="flex h-2.5 touch-none select-none bg-transparent cursor-pointer">
              <ScrollArea.Thumb
                style={{
                  minWidth: "60px", 
                  maxWidth: "120px", 
                }}
                className="relative ounded-lg bg-gray-800 w-20 rounded-md border border-gray-600"
              />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>
      </div>
    </div>
  );
};

export default TimeLineIndex;
