// import { useVideoStore } from "@/State/store";
// import { memo, useCallback, useEffect, useRef, useState } from "react";

// const PlayheadMarker = memo(() => {
//   return (
//     <div className="relative h-full">
//       <div className="absolute top-0 h-full w-3 -translate-x-1/2 transform" />
//       <div className="absolute top-0 h-full w-0.5 -translate-x-1/2 transform bg-white/50" />
//       <div className="absolute h-3 -translate-x-1/2 transform px-1.5">
//         {" "}
//         <svg height="12" viewBox="0 0 12 12" fill="none">
//           <path
//             fill="currentColor"
//             d="M11.6585 7.04881L6.6585 11.4238C6.28148 11.7537 5.71852 11.7537 5.3415 11.4238L0.341495 7.04881C0.12448 6.85892 0 6.58459 0 6.29623V1C0 0.447715 0.447715 0 1 0H11C11.5523 0 12 0.447715 12 1V6.29623C12 6.58459 11.8755 6.85892 11.6585 7.04881Z"
//           />
//         </svg>
//       </div>
//     </div>
//   );
// });
// PlayheadMarker.displayName = "PlayheadMarker";

// const PlayheadPositionCalculator = memo(({ scrollLeft, onPositionChange }) => {
//   const currentTime = useVideoStore((state) => state.currentTime);
//   const scale = useVideoStore((state) => state.scale);

//   const position = currentTime * scale.zoom * 60 - scrollLeft;

//   useEffect(() => {
//     onPositionChange(position);
//   }, [position, onPositionChange]);

//   return null;
// });
// PlayheadPositionCalculator.displayName = "PlayheadPositionCalculator";

// const PlayheadPosition = memo(({ scrollLeft }) => {
//   const playheadRef = useRef(null);
//   const playerRef = useVideoStore((state) => state.playerRef);
//   const scale = useVideoStore((state) => state.scale);
//   const setIsDragging = useVideoStore((state) => state.setIsDragging);
//   const isDragging = useVideoStore((state) => state.isDragging);

//   // const [dragStartX, setDragStartX] = useState(0);
//   const [dragStartPosition, setDragStartPosition] = useState(0);
//   const [localPosition, setLocalPosition] = useState(0);
//   const [initialClientX, setInitialClientX] = useState(0);

//   const handlePositionChange = useCallback(
//     (newPosition) => {
//       if (!isDragging) {
//         setLocalPosition(newPosition);
//         setDragStartPosition(newPosition);
//       }
//     },
//     [isDragging]
//   );

//   const handleMouseDown = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//     const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
//     setInitialClientX(clientX);
//     // setDragStartX(clientX);
//     setLocalPosition(localPosition);
//   };

//   const handleMouseMove = useCallback(
//     (e) => {
//       if (isDragging) {
//         e.preventDefault();
//         const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
//         const delta = clientX - initialClientX;
//         const newPosition = dragStartPosition + delta;
//         setLocalPosition(newPosition);
//         // impt, you drag the playhead, it updates the video's currentTime, this is the key line  playerRef.currentTime = time; and since ur updating the player ref over here
//         // it updates the player ref in the zustand store also
//         // and this gives u that effeect that ohh as u fast forward tumbnails are generated in real time, but thats not the case, since the video is fully loaded in momeory (not the best way to do this though)
//         // since the video sits on client side in memory, as u drag and forward the pin, the browser automatically changes the video time frames
//         const time = (newPosition + scrollLeft) / (scale.zoom * 60);
//         if (playerRef) {
//           playerRef.currentTime = time;
//         }
//       }
//     },
//     [isDragging, initialClientX, dragStartPosition, scrollLeft, scale.zoom, playerRef]
//   );

//   const handleMouseUp = useCallback(() => {
//     setIsDragging(false);
//   }, [setIsDragging]);

//   useEffect(() => {
//     if (isDragging) {
//       document.addEventListener("mousemove", handleMouseMove);
//       document.addEventListener("mouseup", handleMouseUp);
//       document.addEventListener("touchmove", handleMouseMove);
//       document.addEventListener("touchend", handleMouseUp);
//     }

//     return () => {
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseup", handleMouseUp);
//       document.removeEventListener("touchmove", handleMouseMove);
//       document.removeEventListener("touchend", handleMouseUp);
//     };
//   }, [isDragging, handleMouseMove, handleMouseUp]);

//   return (
//     <>
//       <PlayheadPositionCalculator scrollLeft={scrollLeft} onPositionChange={handlePositionChange} />
//       <div
//         ref={playheadRef}
//         onMouseDown={handleMouseDown}
//         onTouchStart={handleMouseDown}
//         style={{
//           position: "absolute",
//           left: `${40 + localPosition}px`,
//           top: "80px",
//           height: "calc(100% - 80px)",
//           width: "1px",
//           background: "#d4d4d8",
//           zIndex: 10,
//           cursor: "col-resize",
//           touchAction: "none",
//           transition: isDragging ? "none" : "left 0.1s linear",
//         }}
//       >
//         <PlayheadMarker />
//       </div>
//     </>
//   );
// });
// PlayheadPosition.displayName = "PlayheadPosition";

// const Playhead = memo(({ scrollLeft }) => {
//   return <PlayheadPosition scrollLeft={scrollLeft} />;
// });
// Playhead.displayName = "Playhead";

// export default Playhead;

// Playhead.jsx
import React, { useRef, useState, useEffect, memo, useCallback } from "react";
import { useVideoStore } from "@/State/store";

const FPS = 60;

const PlayheadMarker = memo(() => {
  return (
    <div className="relative h-full">
      <div className="absolute top-0 h-full w-3 -translate-x-1/2 transform" />
      <div className="absolute top-0 h-full w-0.5 -translate-x-1/2 transform bg-white/50" />
      <div className="absolute h-3 -translate-x-1/2 transform px-1.5">
        <svg height="12" viewBox="0 0 12 12" fill="none">
          <path
            fill="currentColor"
            d="M11.6585 7.04881L6.6585 11.4238C6.28148 11.7537 5.71852 11.7537 5.3415 11.4238L0.341495 7.04881C0.12448 6.85892 0 6.58459 0 6.29623V1C0 0.447715 0.447715 0 1 0H11C11.5523 0 12 0.447715 12 1V6.29623C12 6.58459 11.8755 6.85892 11.6585 7.04881Z"
          />
        </svg>
      </div>
    </div>
  );
});
PlayheadMarker.displayName = "PlayheadMarker";

const PlayheadPositionCalculator = memo(({ scrollLeft, onPositionChange }) => {
  const currentTime = useVideoStore((state) => state.currentTime);
  const scale = useVideoStore((state) => state.scale);

  // Update position calculation to use FPS
  const position = currentTime * FPS * scale.zoom * 60 - scrollLeft;

  useEffect(() => {
    onPositionChange(position);
  }, [position, onPositionChange]);

  return null;
});
PlayheadPositionCalculator.displayName = "PlayheadPositionCalculator";

const PlayheadPosition = memo(({ scrollLeft }) => {
  const playheadRef = useRef(null);
  const playerRef = useVideoStore((state) => state.playerRef);
  const scale = useVideoStore((state) => state.scale);
  const setIsDragging = useVideoStore((state) => state.setIsDragging);
  const isDragging = useVideoStore((state) => state.isDragging);

  const [dragStartPosition, setDragStartPosition] = useState(0);
  const [localPosition, setLocalPosition] = useState(0);
  const [initialClientX, setInitialClientX] = useState(0);
  const videos = useVideoStore((state) => state.videos);

  const handlePositionChange = useCallback(
    (newPosition) => {
      if (!isDragging) {
        setLocalPosition(newPosition);
        setDragStartPosition(newPosition);
      }
    },
    [isDragging]
  );

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setInitialClientX(clientX);
    setLocalPosition(localPosition);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        e.preventDefault();
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const delta = clientX - initialClientX;
        const newPosition = dragStartPosition + delta;
        
        const time = (newPosition + scrollLeft) / (FPS * scale.zoom * 60);
        
        // only update if we're within valid bounds for ANY video
        const isValidTime = videos.some(video => time <= video.duration);
        
        if (isValidTime) {
          setLocalPosition(newPosition);
          // Find longest video that contains this time point
          const targetVideo = videos
            .filter(v => time <= v.duration)
            .reduce((max, video) => video.duration > max.duration ? video : max, videos[0]);
            
          if (targetVideo && playerRef) {
            playerRef.currentTime = time;
          }
        }
      }
    },
    [isDragging, initialClientX, dragStartPosition, scrollLeft, scale.zoom, playerRef, videos]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <>
      <PlayheadPositionCalculator scrollLeft={scrollLeft} onPositionChange={handlePositionChange} />
      <div
        ref={playheadRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{
          position: "absolute",
          left: `${40 + localPosition}px`,
          top: "80px",
          height: "calc(100% - 80px)",
          width: "1px",
          background: "#d4d4d8",
          zIndex: 10,
          cursor: "col-resize",
          touchAction: "none",
          transition: isDragging ? "none" : "left 0.1s linear",
        }}
      >
        <PlayheadMarker />
      </div>
    </>
  );
});
PlayheadPosition.displayName = "PlayheadPosition";

const Playhead = memo(({ scrollLeft }) => {
  return <PlayheadPosition scrollLeft={scrollLeft} />;
});
Playhead.displayName = "Playhead";

export default Playhead;
