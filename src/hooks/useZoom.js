// hooks/useZoom.js
import { useState, useEffect } from 'react';

const useZoom = (containerRef, viewerRef) => {
  const [zoom, setZoom] = useState(1);

  const handlePinch = (e) => {
    setZoom(e.zoom);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newZoom = Math.min(Math.max(0.1, zoom + delta), 3);
        setZoom(newZoom);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom]);

  return { zoom, handlePinch };
};

export default useZoom;