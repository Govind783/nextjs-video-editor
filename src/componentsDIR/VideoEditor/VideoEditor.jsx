import React, { useRef, useState, useEffect } from "react";
import VideoUploader from "./VideoUploader";
import { useVideoStore } from "@/State/store";
import Viewer from "@interactify/infinite-viewer";
import Moveable from "@interactify/moveable";
import Selection from "@interactify/selection";
import useZoom from "@/hooks/useZoom";
import TimeLineIndex from "./timeline/TimeLineIndex";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

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
  const toggleVideoPlayback = useVideoStore((state) => state.toggleVideoPlayback);
  const currentTime = useVideoStore((state) => state.currentTime);
  const texts = useVideoStore((state) => state.texts);
  const setSelectedText = useVideoStore((state) => state.setSelectedText);
  const selectedTextId = useVideoStore((state) => state.selectedTextId);
  const selectedImageId = useVideoStore((state) => state.selectedImageId);
  const updateTextStyle = useVideoStore((state) => state.updateTextStyle);
  const updateVideosCords = useVideoStore((state) => state.updateVideosCords);

  const images = useVideoStore((state) => state.images);
  const [openMenu, setOpenMenu] = useState(null);
  const setSelectedImage = useVideoStore((state) => state.setSelectedImage);
  const updateTextPosition = useVideoStore((state) => state.updateTextPosition);

  const updateImageDimensions = useVideoStore((state) => state.updateImageDimensions);
  const updateImagePosition = useVideoStore((state) => state.updateImagePosition);

  useEffect(() => {
    if (currentVideoId && videoRefs.current[currentVideoId]) {
      setPlayerRef(videoRefs.current[currentVideoId]);
    }
  }, [currentVideoId, videos]);

  const { zoom } = useZoom(containerRef, viewerRef);

  useEffect(() => {
    if (!viewerRef.current) return;

    const selection = new Selection({
      container: viewerRef.current.infiniteViewer.getContainer(),
      boundContainer: true,
      hitRate: 0,
      selectableTargets: [".video-item", ".text-item", ".image-item"],
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
  }, [videos, texts, images]);

  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);

  // 3. Modify the VideoEditor effect to handle playback syncing
  useEffect(() => {
    /// NOTE, when u add ur trimand edit functionality u will have to notify or re reun this effect coz maybe the video was suposedly the longest just got trimmed and now a second video is tyhe longest, so u will have to update ur variables again
    // Find the longest video
    const handleTimeUpdate = () => {
      const longestVideo = videos.reduce((max, video) => (video.duration > max.duration ? video : max), videos[0]);

      if (longestVideo && videoRefs.current[longestVideo.id]) {
        const videoElement = videoRefs.current[longestVideo.id];
        const video = videos.find((v) => v.id === longestVideo.id);

        if (video) {
          const newTime = videoElement.currentTime / video.speed;
          if (newTime >= video.endTime) {
            videoElement.currentTime = 0;
            videoElement.pause();
            setCurrentTime(0);
            toggleVideoPlayback({ isVideoPlaying: false });
            return;
          }

          setCurrentTime(newTime);
        }
      }
    };

    const handleVideoEnd = () => {
      const longestVideo = videos.reduce((max, video) => (video.duration > max.duration ? video : max), videos[0]);
      if (videoRefs.current[longestVideo.id]) {
        const videoElement = videoRefs.current[longestVideo.id];

        videoElement.currentTime = 0;
        setCurrentTime(0);
        toggleVideoPlayback({ isVideoPlaying: false });
      }
    };

    const longestVideo = videos.reduce((max, video) => (video.duration > max.duration ? video : max), videos[0]);
    const longestVideoRef = videoRefs.current[longestVideo?.id];

    if (longestVideoRef) {
      const video = videos.find((v) => v.id === longestVideo.id);

      // Set up initial constraints
      if (video?.endTime) {
        longestVideoRef.onended = () => {
          longestVideoRef.currentTime = 0;
          setCurrentTime(0);
        };
      }

      longestVideoRef.addEventListener("timeupdate", handleTimeUpdate);
      longestVideoRef.addEventListener("ended", handleVideoEnd);

      return () => {
        longestVideoRef.removeEventListener("timeupdate", handleTimeUpdate);
        longestVideoRef.removeEventListener("ended", handleVideoEnd);
      };
    }
  }, [videos]);

  useEffect(() => {
    if (!selectionRef.current) return;
    if (isVideoSelected || selectedImageId || selectedTextId) {
      const el = document.querySelector(`[data-id="${isVideoSelected || selectedImageId || selectedTextId}"]`);
      if (el) {
        setTargets([]);
        setTargets([el]);
      }
    } else {
      setTargets([]);
    }
  }, [isVideoSelected, selectedImageId, selectedTextId]);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      const ignoredElements = [
        ".video-item",
        ".moveable-control",
        ".moveable-line",
        "#timeline-canvas",
        ".videoButtonRightPanel",
        ".right-panel",
        ".right-panel-menu",
        ".image-item",
      ];

      if (ignoredElements.some((selector) => e.target.closest(selector))) {
        return;
      }

      setIsVideoSelected(null);
      // setSelectedText(null)
      // setSelectedImage(null)
      setOpenMenu(null);
      setTargets([]);
    };

    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  useEffect(() => {
    videos.forEach((video) => {
      const videoElement = videoRefs.current[video.id];
      if (videoElement) {
        videoElement.playbackRate = video.speed;
        videoElement.volume = video.volume / 100;
      }
    });
  }, [videos]);

  return (
    <div className="w-full h-full">
      {videos.length > 0 ? (
        <>
          <LeftPanel />
          <RightPanel openMenu={openMenu} setOpenMenu={setOpenMenu} />
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
                    {videos.map((item) => {
                      return (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentVideoId(item.id);
                            setIsVideoSelected(item.id);
                          }}
                          data-id={item.id}
                          key={item.id}
                          className="video-item"
                          style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%)`, // Center the element
                            left: item.x,
                            top: item.y,
                            width: item.width,
                            height: item.height,
                          }}
                        >
                          {item.duration + 0.8 >= currentTime && (
                            <video
                              ref={(el) => {
                                if (el) {
                                  videoRefs.current[item.id] = el;
                                  el.playbackRate = item.speed;
                                  el.volume = item.volume / 100;
                                  // Set playerRef to longest video's ref
                                  const longestVideo = videos.reduce(
                                    (max, v) => (v.duration > max.duration ? v : max),
                                    videos[0]
                                  );
                                  if (item.id === longestVideo.id) {
                                    setPlayerRef(el);
                                  }
                                }
                              }}
                              style={{
                                width: "100%",
                                height: "100%",
                              }}
                              className="rounded-md"
                              src={item.src}
                            />
                          )}
                        </div>
                      );
                    })}
                    {texts.map((item) => {
                      return (
                        item.duration + 0.8 >= currentTime && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedText(item.id);
                              setTargets([e.currentTarget]);
                            }}
                            data-id={item.id}
                            data-text-id={item.id}
                            key={item.id}
                            className="text-item rounded-md"
                            style={{
                              position: "absolute",
                              transform: `translate(-50%, -50%)`, // Center the element
                              left: item.x,
                              top: item.y,
                              color: item.color,
                              fontSize: `${item.fontSize}px`,
                              opacity: item.opacity / 100,
                              padding: `${item.padding}px`,
                              cursor: "pointer",
                              userSelect: "none",
                              fontWeight: item.fontWeight,
                              backgroundColor: item.backgroundColor || "transparent",
                              textDecoration: item.isUnderline ? "underline" : "",
                              width: `${item.width}px`,
                              height: `${item.height}px`,
                              textAlign: "center",
                              zIndex: 9,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span>{item.description}</span>
                          </div>
                        )
                      );
                    })}

                    {images.map((item) => {
                      return (
                        item.duration + 0.8 >= currentTime && (
                          <div
                            data-id={item.id}
                            key={item.id}
                            data-image-id={item.id}
                            style={{
                              position: "absolute",
                              transform: `translate(-50%, -50%)`, // Center the element
                              left: item.x,
                              top: item.y,
                              width: `${item.width}px`,
                              height: `${item.height}px`,
                            }}
                            className="image-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(item.id);
                              setTargets([e.currentTarget]); // Changed from e.target to e.currentTarget
                            }}
                          >
                            <img
                              src={item.src}
                              draggable="false"
                              
                              style={{
                                width: "100%",
                                height: "100%",
                                opacity: item.opacity / 100,
                                cursor: "pointer",
                                borderRadius: `${item.borderRadius}px`,
                                userSelect: "none",
                              }}
                            />
                          </div>
                        )
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
                      if (target.classList.contains("video-item")) {
                        updateVideosCords(target.dataset.id, { x: left, y: top });
                      } else if (target.dataset.textId) {
                        updateTextPosition(target.dataset.textId, left, top);
                      } else if (target.dataset.imageId) {
                        updateImagePosition(target.dataset.imageId, left, top);
                      }
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
                        const currentWidth = parseFloat(target.style.width || target.clientWidth);
                        const currentHeight = parseFloat(target.style.height || target.clientHeight);

                        const newWidth = currentWidth * scaleX;
                        const newHeight = currentHeight * scaleY;

                        target.style.width = `${newWidth}px`;
                        target.style.height = `${newHeight}px`;

                        const diffX = currentWidth - newWidth;
                        const diffY = currentHeight - newHeight;

                        let newLeft = parseFloat(target.style.left || 0) - diffX / 2;
                        let newTop = parseFloat(target.style.top || 0) - diffY / 2;

                        if (moveX) newLeft += diffX;
                        if (moveY) newTop += diffY;

                        target.style.left = `${newLeft}px`;
                        target.style.top = `${newTop}px`;

                        if (target.classList.contains("video-item")) {
                          updateVideosCords(target.dataset.id, {
                            width: newWidth,
                            height: newHeight,
                            x: newLeft,
                            y: newTop,
                          });
                        } else if (target.dataset.textId) {
                          updateTextStyle(target.dataset.textId, {
                            width: newWidth,
                            height: newHeight,
                          });
                          updateTextPosition(target.dataset.textId, newLeft, newTop);
                        } else if (target.classList.contains("image-item")) {
                          // Changed to check for class instead of dataset
                          updateImageDimensions(target.dataset.imageId, newWidth, newHeight);
                          updateImagePosition(target.dataset.imageId, newLeft, newTop);
                        }
                      }
                    }}
                    // onRotate={({ target, transform }) => {
                    //   target.style.transform = transform;
                    // }}
                    onResize={({ target, width, height, direction }) => {
                      if (target.classList.contains("video-item")) {
                        if (direction[1] === 1) {
                          const currentWidth = target.clientWidth;
                          const currentHeight = target.clientHeight;
                          const scaleY = height / currentHeight;
                          const scale = scaleY;

                          const newWidth = currentWidth * scale;
                          const newHeight = currentHeight * scale;

                          target.style.width = `${newWidth}px`;
                          target.style.height = `${newHeight}px`;

                          const left = parseFloat(target.style.left || 0);
                          const top = parseFloat(target.style.top || 0);

                          updateVideosCords(target.dataset.id, {
                            width: newWidth,
                            height: newHeight,
                            x: left, 
                            y: top,
                          });
                        } else {
                          target.style.width = `${width}px`;
                          target.style.height = `${height}px`;

                          const left = parseFloat(target.style.left || 0);
                          const top = parseFloat(target.style.top || 0);

                          updateVideosCords(target.dataset.id, {
                            width: width,
                            height: height,
                            x: left, 
                            y: top,
                          });
                        }
                      } else if (target.dataset.textId) {
                        // const textId = target.dataset.textId;
                        const currentFontSize = parseFloat(target.style.fontSize);
                        const heightRatio = height / target.offsetHeight;
                        // const newFontSize = Math.max(13, Math.round(currentFontSize * heightRatio));
                        const newFontSize = Math.max(13, Math.round(currentFontSize * Math.sqrt(heightRatio)));

                        target.style.fontSize = `${newFontSize}px`;
                        target.style.width = `${width}px`;
                        target.style.height = `${height}px`;
                        updateTextStyle(target.dataset.textId, { fontSize: newFontSize, width, height }); // apply debounce on this later, ig lets update tsrget insteanlty for instat ui feedback but state can be updated in a debounced fashion
                      } else if (target.dataset.imageId) {
                        if (direction[1] === 1) {
                          const currentWidth = target.clientWidth;
                          const currentHeight = target.clientHeight;
                          const scaleY = height / currentHeight;
                          const scale = scaleY;

                          const newWidth = currentWidth * scale;
                          const newHeight = currentHeight * scale;

                          target.style.width = `${newWidth}px`;
                          target.style.height = `${newHeight}px`;
                          updateImageDimensions(target.dataset.imageId, newWidth, newHeight);
                        } else {
                          target.style.width = `${width}px`;
                          target.style.height = `${height}px`;
                          updateImageDimensions(target.dataset.imageId, width, height);
                        }
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
