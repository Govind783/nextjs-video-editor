import React, { useRef, useState, useEffect } from "react";
import VideoUploader from "./VideoUploader";
import { useVideoStore } from "@/State/store";
import Viewer from "@interactify/infinite-viewer";
import Moveable from "@interactify/moveable";
import Selection from "@interactify/selection";
import useZoom from "@/hooks/useZoom";
import TimeLineIndex from "./timeline/TimeLineIndex";
import LeftPanel from "./LeftPanel";

const VideoEditor = () => {
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const moveableRef = useRef(null);
  const [targets, setTargets] = useState([]);
  const selectionRef = useRef(null);

  const isVideoSelected = useVideoStore((state) => state.isVideoSelected);
  const setCurrentVideoId = useVideoStore((state) => state.setCurrentVideoId);
  const setIsVideoSelected = useVideoStore((state) => state.setIsVideoSelected);

  const videos = useVideoStore((state) => state.videos);
  const setPlayerRef = useVideoStore((state) => state.setPlayerRef);
  const currentVideoId = useVideoStore((state) => state.currentVideoId);
  const videoRefs = useRef({});
  const toggleVideoPlayback = useVideoStore((state) => state.toggleVideoPlayback)
  const currentTime = useVideoStore((state) => state.currentTime);

  useEffect(() => {
    if (currentVideoId && videoRefs.current[currentVideoId]) {
      setPlayerRef(videoRefs.current[currentVideoId]);
    }
  }, [currentVideoId, setPlayerRef]);

  const { zoom } = useZoom(containerRef, viewerRef);

  useEffect(() => {
    if (!viewerRef.current) return;

    const selection = new Selection({
      container: viewerRef.current.infiniteViewer.getContainer(),
      boundContainer: true,
      hitRate: 0,
      selectableTargets: [".video-item"],
      selectFromInside: false,
      selectByClick: true,
      toggleContinueSelect: "shift",
    })
      .on("select", (e) => {
        setTargets(e.selected);
      })
      .on("selectEnd", (e) => {
        setTargets(e.selected);
      });

    selectionRef.current = selection;
    return () => {
      selection.destroy();
    };
  }, [videos]);

  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);

useEffect(() => {
  const handleTimeUpdate = () => {
     /// NOTE, when u add ur trimand edit functionality u will have to notify or re reun this effect coz maybe the video was suposedly the longest just got trimmed and now a second video is tyhe longest, so u will have to update ur variables again
      // Find the longest video
    const longestVideo = videos.reduce((max, video) => 
      video.duration > max.duration ? video : max, videos[0]
    );
  
    if (longestVideo && videoRefs.current[longestVideo.id]) {
      setCurrentTime(videoRefs.current[longestVideo.id].currentTime);
    }
  };

  const handleVideoEnd = () => {
    toggleVideoPlayback({ isVideoPlaying: false });
  };

  const longestVideo = videos.reduce((max, video) => 
    video.duration > max.duration ? video : max, videos[0]
  );

  const longestVideoRef = videoRefs.current[longestVideo?.id];
  if (longestVideoRef) {
    longestVideoRef.addEventListener("timeupdate", handleTimeUpdate);
    longestVideoRef.addEventListener("ended", handleVideoEnd);
    return () => {
      longestVideoRef.removeEventListener("timeupdate", handleTimeUpdate);
      longestVideoRef.removeEventListener("ended", handleVideoEnd); 
    };
  }
}, [videos, setCurrentTime]);


  useEffect(() => {
    if (!selectionRef.current) return;
    if (isVideoSelected) {
      const videoElement = document.querySelector(`[data-video-id="${isVideoSelected}"]`);
      if (videoElement) {
        setTargets([]);
        setTargets([videoElement]);
      }
    } else {
      setTargets([]);
    }
  }, [isVideoSelected]);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (
        e.target.closest(".video-item") ||
        e.target.closest(".moveable-control") ||
        e.target.closest(".moveable-line") ||
        e.target.closest("#timeline-canvas")
      ) {
        return;
      }

      setIsVideoSelected(null);
      setTargets([]);
    };
    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  return (
    <div className="w-full h-full">
      {videos.length > 0 ? (
        <>
          <LeftPanel />
          <div className="w-full h-full" ref={containerRef}>
            <div className="w-full h-full bg-gray-950">
              <Viewer
                ref={viewerRef}
                className="player-container h-[650px] bg-scene"
                displayHorizontalScroll={false}
                displayVerticalScroll={false}
                zoom={1}
                usePinch={false}
                pinchThreshold={50}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: `scale(${zoom})`,
                    transformOrigin: "center",
                  }}
                >
                  <div className="flex justify-center p-8 pt-16">
                    {videos.map((item, index) => {
                      return (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentVideoId(item.id);
                            setIsVideoSelected(item.id);
                          }}
                          data-video-id={item.id}
                          key={index}
                          className="video-item"
                          style={{ position: "absolute" }}
                        >
                          {item.duration >= currentTime && ( // here is it >= coz if u just do > then it removes the video form the dom, not the best solution but for now fine, TODO fix later this is more for a situation when the video ends and the guy presses on play again
                            <video
                              ref={(el) => {
                                if (el) {
                                  videoRefs.current[item.id] = el;
                                  // IMPORTANT: set playerRef to longest video's ref
                                  const longestVideo = videos.reduce(
                                    (max, v) => (v.duration > max.duration ? v : max),
                                    videos[0]
                                  );
                                  if (item.id === longestVideo.id) {
                                    setPlayerRef(el);
                                  }
                                }
                              }}
                              style={{ width: "100%", height: "100%" }}
                              className="rounded-md"
                              src={item.src}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Moveable
                    ref={moveableRef}
                    target={targets}
                    draggable={true}
                    resizable={true}
                    rotatable={false}
                    zoom={1 / zoom}
                    origin={false}
                    //   rotationPosition={"bottom"}
                    renderDirections={["nw", "ne", "sw", "se", "n", "s", "e", "w"]}
                    onDrag={({ target, top, left }) => {
                      target.style.top = `${top}px`;
                      target.style.left = `${left}px`;
                    }}
                    onScale={({ target, transform, direction }) => {
                      const [xControl, yControl] = direction;
                      const moveX = xControl === -1;
                      const moveY = yControl === -1;

                      target.style.transform = transform;

                      const scaleRegex = /scale\(([^)]+)\)/;
                      const match = target.style.transform.match(scaleRegex);
                      if (match) {
                        const [scaleX, scaleY] = match[1].split(",").map((v) => parseFloat(v));

                        const currentWidth = target.clientWidth * scaleX;
                        const currentHeight = target.clientHeight * scaleY;
                        const newWidth = target.clientWidth * parseFloat(transform.match(scaleRegex)[1].split(",")[0]);
                        const newHeight =
                          target.clientHeight * parseFloat(transform.match(scaleRegex)[1].split(",")[1]);

                        const diffX = currentWidth - newWidth;
                        const diffY = currentHeight - newHeight;

                        let newLeft = parseFloat(target.style.left || 0) - diffX / 2;
                        let newTop = parseFloat(target.style.top || 0) - diffY / 2;

                        if (moveX) newLeft += diffX;
                        if (moveY) newTop += diffY;

                        target.style.left = `${newLeft}px`;
                        target.style.top = `${newTop}px`;
                      }
                    }}
                    // onRotate={({ target, transform }) => {
                    //   target.style.transform = transform;
                    // }}
                    onResize={({ target, width, height, direction }) => {
                      if (direction[1] === 1) {
                        const currentWidth = target.clientWidth;
                        const currentHeight = target.clientHeight;
                        const scaleY = height / currentHeight;
                        const scale = scaleY;

                        target.style.width = `${currentWidth * scale}px`;
                        target.style.height = `${currentHeight * scale}px`;
                      } else {
                        target.style.width = `${width}px`;
                        target.style.height = `${height}px`;
                      }
                    }}
                  />
                </div>
              </Viewer>
            </div>
          </div>
          <div className="mt-4">
            <TimeLineIndex />
          </div>
        </>
      ) : (
        <VideoUploader />
      )}
    </div>
  );
};

export default VideoEditor;
