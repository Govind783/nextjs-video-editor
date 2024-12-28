
import React, { useEffect, useRef, useState, memo } from "react";
import { useVideoStore } from "@/State/store";
import { formatTimelineUnit } from "@/helpers/formatTime";

const RULER_HEIGHT = 40;
const FPS = 60;
const FRAME_WIDTH = 188;

const RulerCanvas = memo(({ scrollLeft, scale, onClick }) => {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: RULER_HEIGHT
  });

  const resize = (canvas, context, scrollPos) => {
    if (!canvas || !context) return;

    const offsetParent = canvas.offsetParent;
    const width = offsetParent?.offsetWidth ?? canvas.offsetWidth;
    const height = canvasSize.height;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.scale(dpr, dpr);

    draw(context, scrollPos, width, height);
    setCanvasSize({ width, height });
  };

  const draw = (context, scrollPos, width, height) => {
    context.clearRect(0, 0, width, height);
    context.save();
  
    
    context.strokeStyle = "#3f3f46";
    context.fillStyle = "#71717a";
    context.lineWidth = 1;
    context.font = "12px sans-serif";
    context.textBaseline = "top";
  
    
    const pixelsPerSecond = FPS * scale.zoom * 60;
    const timeAtScroll = scrollPos / pixelsPerSecond;
    const timePerScreen = width / pixelsPerSecond;
    
    
    const startTime = Math.floor(timeAtScroll);
    const endTime = Math.ceil(timeAtScroll + timePerScreen);
  
    // major ticks and labels
    for (let time = startTime; time <= endTime; time++) {
      const xPos = (time * pixelsPerSecond) - scrollPos + 40;
  
      if (xPos < -100 || xPos > width + 100) continue;
  
      if (time % 5 === 0) {
        // Major tick and label every 5 seconds
        context.strokeStyle = "#52525b";
        context.beginPath();
        context.moveTo(xPos, 24);
        context.lineTo(xPos, 38);
        context.stroke();
  
        // MM:SS
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const text = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        const textWidth = context.measureText(text).width;
        context.fillText(text, xPos - textWidth / 2, 4);
      }
  
      // minor ticks for each second
      context.strokeStyle = "#3f3f46";
      context.beginPath();
      context.moveTo(xPos, 28);
      context.lineTo(xPos, 36);
      context.stroke();
  
      // sub-second ticks, personal prefrence ig the time liner and ruler loks cleaner without these
      // if (time < endTime) {
      //   const nextXPos = ((time + 1) * pixelsPerSecond) - scrollPos + 40;
      //   const tickInterval = (nextXPos - xPos) / 5;
        
      //   for (let i = 1; i < 5; i++) {
      //     const subTickX = xPos + (i * tickInterval);
      //     if (subTickX < width) {
      //       context.beginPath();
      //       context.moveTo(subTickX, 30);
      //       context.lineTo(subTickX, 34);
      //       context.stroke();
      //     }
      //   }
      // }
    }
  
    context.restore();
  };


  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      resize(canvas, context, scrollLeft);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      resize(canvas, context, scrollLeft);
    }
  }, [scrollLeft, scale]);

  const handleClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const totalX = clickX + scrollLeft - 40;

    onClick?.(totalX);
  };

  return (
    <canvas
      ref={canvasRef}
      height={canvasSize.height}
      className="absolute top-0 left-4 pt-2"
      onMouseUp={handleClick}
      style={{
        width: `${canvasSize.width}px`,
        height: `${canvasSize.height}px`
      }}
    />
  );
});

RulerCanvas.displayName = "RulerCanvas";

const ScaleProvider = memo(({ children }) => {
  const scale = useVideoStore((state) => state.scale);
  return React.Children.map(children, (child) => React.cloneElement(child, { scale }));
});

ScaleProvider.displayName = "ScaleProvider";

const Ruler = ({ scrollLeft, onClick }) => {
  return (
    <div className="relative border-t border-[#27272a]" style={{ height: `${RULER_HEIGHT}px` }}>
      <ScaleProvider>
        <RulerCanvas
          scrollLeft={scrollLeft}
          onClick={onClick}
        />
      </ScaleProvider>
    </div>
  );
};

export default Ruler;