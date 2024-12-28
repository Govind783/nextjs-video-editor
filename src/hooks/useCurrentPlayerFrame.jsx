import { useEffect, useState } from 'react';

export const useCurrentPlayerFrame = (playerRef) => {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    if (!playerRef) return;

    const handleTimeUpdate = () => {
      const currentTime = playerRef.currentTime;
      const frame = Math.round(currentTime * 30); // 30fps
      setCurrentFrame(frame);
    };

    playerRef.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      playerRef.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [playerRef]);

  return currentFrame;
};