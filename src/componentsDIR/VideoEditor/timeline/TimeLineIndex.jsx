// IMPORTANT
// -> WHEN TRIMMING THE VIDEO BY DRAGGING WE FIRST update the duraion per video in onMouseUp and then
// since the gloabl duation object co-relates with the longest video we do a simple Math.max()
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useVideoStore } from "@/State/store";
import Header from "./Header";
import Ruler from "./Ruler";
import Playhead from "./TimeStampThumbnails";
import * as ScrollArea from "@radix-ui/react-scroll-area";

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

const TIMELINE_OFFSET_CANVAS_LEFT = 10;
const TIMELINE_OFFSET_RIGHT = 40;
const FPS = 60;

const TimeLineIndex = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const horizontalScrollRef = useRef(null);
  // const isDragging = useVideoStore((state) => state.isDragging);
  const isVideoSelected = useVideoStore((state) => state.isVideoSelected);
  const setIsVideoSelected = useVideoStore((state) => state.setIsVideoSelected);
  const scale = useVideoStore((state) => state.scale);
  const videos = useVideoStore((state) => state.videos);
  const currentTime = useVideoStore((state) => state.currentTime);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [durationLocal, setDuratrionLocal] = useState(0);
  const setDuration = useVideoStore((state) => state.setDuration);
  const totalTimelineWidth = durationLocal * FPS * scale.zoom * 60;
  const videoRegions = useRef([]);
  const playerRef = useVideoStore((state) => state.playerRef);
  const texts = useVideoStore((state) => state.texts);
  const setSelectedText = useVideoStore((state) => state.setSelectedText);
  const updateTextsTime = useVideoStore((state) => state.updateTextsTime);
  const selectedTextId = useVideoStore((state) => state.selectedTextId);
  const updateVideoTimes = useVideoStore((state) => state.updateVideoTimes);
  const textRegionsRef = useRef([]);
  const setTextIsDragging = useVideoStore((state) => state.setTextIsDragging);
  const dragStateRef = useRef({
    isDragging: true,
    videoId: null,
    handle: null,
  });
  useEffect(() => {
    let maxDuartion = 0;
    for (let i = 0; i < videos.length; i++) {
      if (videos[i].duration > maxDuartion) {
        maxDuartion = videos[i].duration;
        setDuratrionLocal(videos[i].duration);
      }
    }
  }, [videos]);

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
    const calculatedHeight = Math.max(230, (videos.length + texts.length) * 60);
    canvas.width = canvasWidth * dpr;
    canvas.height = calculatedHeight * dpr;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    videoRegions.current = [];

    // video rectangle onm time TL
    videos.forEach((video, index) => {
      const isShortVideo = video.originalDuration <= 15;
      const handleWidth = isShortVideo ? 12 : 16;
      const fontSize = isShortVideo ? 12 : 15;
      const arrowSize = isShortVideo ? 4 : 5;
      const lineWidth = isShortVideo ? 1 : 1.5;
      const textOffset = isShortVideo ? 32 : 44;

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
          height: height,
        },
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

      // Configuration for handle dimensions
      const handleHeight = height;

      // Left handle
      // Base background for the entire handle area
      // ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      // ctx.beginPath();
      // ctx.roundRect(startX, y, handleWidth, handleHeight, [4, 0, 0, 4]);
      // ctx.fill();

      // // Left arrow - moved 2px to the right and increased arrow size
      // ctx.beginPath();
      // ctx.moveTo(startX + 28, y + height / 2); // Start point moved right
      // ctx.lineTo(startX + 13, y + height / 2); // Horizontal line moved right
      // ctx.moveTo(startX + 13, y + height / 2); // Arrow head base moved right
      // ctx.lineTo(startX + 18, y + height / 2 - 5); // Upper arrow head - larger
      // ctx.moveTo(startX + 13, y + height / 2); // Back to arrow head base
      // ctx.lineTo(startX + 18, y + height / 2 + 5); // Lower arrow head - larger
      // ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      // ctx.lineWidth = 1.5;
      // ctx.stroke();

      // Right handle
      // Right handle
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.roundRect(startX + width - handleWidth - 10, y, handleWidth, handleHeight, [0, 4, 4, 0]);
      ctx.fill();

      // Right arrow with conditional sizing
      ctx.beginPath();
      const rightArrowX = startX + width - handleWidth - 11;
      const arrowLineLength = isShortVideo ? 8 : 12; // Reduce horizontal line length for short videos
      const arrowOffset = isShortVideo ? 5 : 7; // Reduce the arrow head offset for short videos

      ctx.moveTo(rightArrowX - arrowOffset, y + height / 2); // Start point - adjusted
      ctx.lineTo(rightArrowX + arrowLineLength, y + height / 2); // Horizontal line - adjusted
      ctx.moveTo(rightArrowX + arrowLineLength, y + height / 2); // Arrow head base - adjusted
      ctx.lineTo(rightArrowX + (arrowLineLength - 5), y + height / 2 - arrowSize); // Upper arrow head
      ctx.moveTo(rightArrowX + arrowLineLength, y + height / 2); // Back to arrow head base
      ctx.lineTo(rightArrowX + (arrowLineLength - 5), y + height / 2 + arrowSize); // Lower arrow head
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Draw text
      ctx.fillStyle = "#999";
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillText(`▶ Video ${index + 1}`, isShortVideo ? 16 : startX - 20 + textOffset, y + height / 2);
    });
    const textAreaStartY = videos.length * (50 + 10) + 40;
    ctx.clearRect(0, textAreaStartY, canvas.width, calculatedHeight);

    textRegionsRef.current = [];

    texts.forEach((text, index) => {
      const startX = text.startTime * FPS * scale.zoom * 60 + 6;
      const width = (text.endTime - text.startTime) * FPS * scale.zoom * 60;
      const height = 30;
      const y = (videos.length + index) * (height + 10) + 85;

      // Store text region
      textRegionsRef.current.push({
        id: text.id,
        bounds: {
          x: startX,
          y,
          width,
          height,
        },
      });

      ctx.beginPath();
      ctx.fillStyle = text.id === selectedTextId ? "#2a3a5a" : "black";
      ctx.roundRect(startX, y, width, height, 4);
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.strokeStyle = text.id === selectedTextId ? "white" : "#425292";
      ctx.lineWidth = 1;
      ctx.roundRect(startX, y, width, height, 4);
      ctx.stroke();
      ctx.closePath();

      const handleWidth = 12;
      ctx.beginPath();
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.roundRect(startX + width - handleWidth - 10, y, handleWidth, height, [0, 4, 4, 0]);
      ctx.fill();
      ctx.closePath();

      const rightArrowX = startX + width - handleWidth - 11;
      const arrowLineLength = 8;
      const arrowSize = 4;

      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1;

      ctx.moveTo(rightArrowX - 5, y + height / 2);
      ctx.lineTo(rightArrowX + arrowLineLength, y + height / 2);
      ctx.moveTo(rightArrowX + arrowLineLength, y + height / 2);
      ctx.lineTo(rightArrowX + (arrowLineLength - 5), y + height / 2 - arrowSize);
      ctx.moveTo(rightArrowX + arrowLineLength, y + height / 2);
      ctx.lineTo(rightArrowX + (arrowLineLength - 5), y + height / 2 + arrowSize);
      ctx.stroke();
      ctx.closePath();

      ctx.fillStyle = "#999";
      ctx.font = "12px sans-serif";
      ctx.textBaseline = "middle";
      const truncatedText = text.description.length > 15 ? `${text.description.substring(0, 15)}...` : text.description;
      ctx.fillText(`Text ${index + 1}: ${truncatedText}`, startX + 10, y + height / 2);
    });
  }, [videos, scale.zoom, isVideoSelected, canvasWidth, texts, selectedTextId]);

  useEffect(() => {
    console.log(texts);
  }, [texts]);

  const handleCanvasClick = useCallback(
    (e) => {
      e.stopPropagation();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - TIMELINE_OFFSET_CANVAS_LEFT + scrollLeft;
      const y = e.clientY - rect.top;

      const clickedRegion = videoRegions.current.find(
        (region) =>
          x >= region.bounds.x &&
          x <= region.bounds.x + region.bounds.width &&
          y >= region.bounds.y &&
          y <= region.bounds.y + region.bounds.height
      );

      if (clickedRegion) {
        setIsVideoSelected(clickedRegion.id);
        setSelectedText(null);
        return;
      }

      const clickedTextRegion = textRegionsRef.current.find(
        (region) =>
          x >= region.bounds.x &&
          x <= region.bounds.x + region.bounds.width &&
          y >= region.bounds.y &&
          y <= region.bounds.y + region.bounds.height
      );

      if (clickedTextRegion) {
        setSelectedText(clickedTextRegion.id);
        setIsVideoSelected(null);
      } else {
        setSelectedText(null);
        setIsVideoSelected(null);
      }
    },
    [scrollLeft, videos.length, texts]
  );

  const handleMouseUp = useCallback(() => {
    if (dragStateRef.current.isDragging) {
      if (dragStateRef.current.textId) {
        const text = texts.find((t) => t.id === dragStateRef.current.textId);
        if (text) {
          if (canvasRef.current) {
            canvasRef.current.style.transition = "width 0.3s ease-out";
          }

          const newDuration = text.endTime - text.startTime;
          updateTextsTime(text.id, text.endTime);

          setTimeout(() => {
            if (canvasRef.current) {
              canvasRef.current.style.transition = "";
            }
          }, 300);
        }
      } else {
        const video = videos.find((v) => v.id === dragStateRef.current.videoId);
        if (video) {
          // add transition style to canvas
          // reason for the dtransition since we're clipping and trimming in real time, and the moment the MouseUp event gets fired, the video rectangle on the TL gets shortened and immediately the canvas is also autoshrunk, since the canvas size is variable and keeps changing based on video lenght, so to avoid a veeyr rough UX that is immediate canvas size reduction along with Tl's reduction we have added the transition
          if (canvasRef.current) {
            canvasRef.current.style.transition = "width 0.3s ease-out";
          }

          const newDuration = video.endTime - video.startTime;
          updateVideoTimes(video.id, {
            duration: newDuration,
          });

          const maxDuration = Math.max(...videos.map((v) => v.endTime - v.startTime));
          setDuratrionLocal(maxDuration);
          setDuration(maxDuration);

          // remove transition after animation completes
          setTimeout(() => {
            if (canvasRef.current) {
              canvasRef.current.style.transition = "";
            }
          }, 300);
        }
      }
    }

    dragStateRef.current = {
      isDragging: false,
      videoId: null,
      textId: null,
      handle: null,
    };
  }, [videos, texts]);

  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const region of videoRegions.current) {
      const { bounds, id } = region;
      if (y >= bounds.y && y <= bounds.y + bounds.height) {
        const handleWidth = 12;
        const tolerance = 8;

        const rightHandleX = bounds.x + bounds.width - handleWidth - 10;

        // Left handle check for not comming out triumming from left side
        // if (Math.abs(x - bounds.x) <= tolerance + handleWidth) {
        //   dragStateRef.current = {
        //     isDragging: true,
        //     videoId: id,
        //     handle: "start",
        //   };
        //   return;
        // }

        // Right handle check
        if (Math.abs(x - rightHandleX) <= tolerance + handleWidth) {
          dragStateRef.current = {
            isDragging: true,
            videoId: id,
            handle: "end",
          };
          return;
        }
      }
    }

    for (const region of textRegionsRef.current) {
      const { bounds, id } = region;
      if (y >= bounds.y && y <= bounds.y + bounds.height) {
        const handleWidth = 12;
        const tolerance = 8;

        const rightHandleX = bounds.x + bounds.width - handleWidth - 10;

        if (Math.abs(x - rightHandleX) <= tolerance + handleWidth) {
          dragStateRef.current = {
            isDragging: true,
            textId: id,
            handle: "end",
          };
          setTextIsDragging(true);
          return;
        }
      }
    }
  }, []);

  const handleDrag = useCallback(
    (e) => {
      if (!dragStateRef.current.isDragging) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;

      const canvasWidth = canvas.width / (window.devicePixelRatio || 1);

      // return if dragging beyond canvas width
      if (dragStateRef.current.handle === "end" && x > canvasWidth) {
        return;
      }

      // x position to time
      const timePosition = Math.max(0, (x - TIMELINE_OFFSET_CANVAS_LEFT) / (FPS * scale.zoom * 60));

      if (dragStateRef.current.videoId) {
        const video = videos.find((v) => v.id === dragStateRef.current.videoId);
        if (!video) return;

        const MIN_DELTA = Math.min(video.originalDuration - 2, 20);

        if (dragStateRef.current.handle === "start") {
          // commenting out for nowm 2-01-25, the functioanlity is working and so it the UI but commenting out as idk if trimming from both sides be allowed, espically if we build a split feature?
          // // For left handle:
          // // 1. Don't go below 0
          // // 2. Don't exceed endTime - MIN_DELTA
          // const newStartTime = Math.max(
          //   0, // Don't go below 0
          //   Math.min(
          //     timePosition,
          //     video.endTime - MIN_DELTA // Maintain minimum delta from end
          //   )
          // );
          // updateVideoTimes(video.id, { startTime: newStartTime });
        } else {
          // For right handle:
          // 1. Don't exceed canvas width
          // 2. Don't go below startTime + MIN_DELTA
          // 3. dont let it get dragged beyond its own width
          const maxTime = Math.min(
            (canvasWidth - TIMELINE_OFFSET_CANVAS_LEFT) / (FPS * scale.zoom * 60),
            video.originalDuration
          );

          const newEndTime = Math.min(maxTime, Math.max(video.startTime + MIN_DELTA, timePosition));

          updateVideoTimes(video.id, {
            endTime: newEndTime,
            playbackOffset: currentTime,
            startTime: 0,
          });

          if (playerRef) {
            playerRef.currentTime = currentTime;
          }
        }
      }

      
      if (dragStateRef.current.textId) {
        const text = texts.find((t) => t.id === dragStateRef.current.textId);
        if (!text) return;

        const MIN_DELTA = 3; 

        if (dragStateRef.current.handle === "start") {
        } else {
          // For texts, we don't limit by duration - they can extend
          const maxTime = (canvasWidth - TIMELINE_OFFSET_CANVAS_LEFT) / (FPS * scale.zoom * 60);
          const newEndTime = Math.max(text.startTime + MIN_DELTA, timePosition);

          updateTextsTime(text.id, newEndTime);
        }
      }
    },
    [scale.zoom, videos, texts, updateVideoTimes, updateTextsTime, currentTime]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleDrag, handleMouseUp]);

  return (
    <div className="relative min-h-60 max-h-fit w-full overflow-hidden bg-gray-900/50 border-t pb-7 border-t-gray-700">
      <Header />
      <Ruler
        scrollLeft={scrollLeft}
        startTimeIN_Current_ViewPort={scrollLeft / (FPS * scale.zoom * 60)}
        lastTimeUnit_IN_CurreentViewPort={(scrollLeft + viewportWidth) / (FPS * scale.zoom * 60)}
      />
      <Playhead scrollLeft={scrollLeft} />

      <div className="flex">
        <div className="relative w-10 flex-none" />
        <div
          style={{
            height: Math.max(230, (videos.length + texts.length) * 60),
          }}
          className="relative h-fit  flex-1"
        >
          <div
            style={{
              height: Math.max(230, (videos.length + texts.length) * 60),
            }}
            className="absolute top-0 w-full"
            ref={containerRef}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              style={{
                position: "absolute",
                top: 0,
                left: TIMELINE_OFFSET_CANVAS_LEFT,
                width: `${canvasWidth}px`,
                height: Math.max(230, (videos.length + texts.length) * 60),
                willChange: "transform",
                zIndex: 2,
                pointerEvents: "all",
                transition: "width 0.3s ease-out",
              }}
            />
          </div>

          <ScrollArea.Root
            type="always"
            style={{
              position: "absolute",
              width: "calc(100vw - 40px)",
              height: "20px",
              marginTop: Math.max(162, (videos.length + texts.length) * 60),
            }}
            className="ScrollAreaRootH z-[3]"
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
            <ScrollArea.Scrollbar
              orientation="horizontal"
              className="flex h-2.5 touch-none select-none bg-transparent cursor-pointer"
            >
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
