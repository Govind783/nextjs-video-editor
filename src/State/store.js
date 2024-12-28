import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export const useVideoStore = create((set, get) => ({
  videos: [],
  currentVideoId: null, // used throighoug to acces the play pause state the video player and etc
  isVideoSelected: null, // state to sync the selected vide UI between the preview and the time line

  // timeline specific
  scale: {
    zoom: 1 / 300, // base zoom level
    unit: 1, // unit for timeline
    segments: 10, // Number of segments between major markers
    pixelsPerSecond: 60,
  },
  duration: 0, // the total video lenght in s
  currentTime: 0, // this updates based on the duration of the longest video so lets say 240s were todtal u play for 1min, then this becomes 60
  fps: 30,
  // scrollLeft: 0, /// dont need this  (for now, or maybe forevver, made this state local and it does work, so idk maybe delete, keep for now)

  isDragging: false,
  playerRef: null,

  setScale: (newScale) =>
    set((state) => ({
      scale: { ...state.scale, ...newScale },
    })),

  // setScrollLeft: (scrollLeft) => set({ scrollLeft }), /// dont need this  (for now, or maybe forevver, made this state local and it does work, so idk maybe delete, keep for now)
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setPlayerRef: (ref) => set({ playerRef: ref }),

  addVideo: (videoData) => {
    // const MAX_DURATION = 1800;
    const MAX_DURATION = 1500 // 1800 can be handled but for safe side im doing 1500

    if (videoData.duration > MAX_DURATION) {
      return false
    }

    // this liomit is needed rn bcoz browsers have a hard limit on = 16384px of canvas width and hence u cannot zoom in zoom out till the last second and hence i also commented out the zoom in zoom out thig, todo work on thjis later
    const newVideo = {
      id: uuidv4(),
      src: URL.createObjectURL(videoData.videoBlob),
      duration: videoData.duration,
      startTime: videoData.startTime || 0,
      endTime: videoData.endTime || videoData.duration,
      isPlaying: false,
      isDragging: false,
    };

    set((state) => ({
      videos: [...state.videos, newVideo],
      currentVideoId: newVideo.id,
      duration: Math.max(state.duration, newVideo.duration),
    }));
    return true;
  },

  updateVideoTime: (id, time) =>
    set((state) => ({
      videos: state.videos.map((v) => (v.id === id ? { ...v, currentTime: time } : v)),
    })),
  setIsDragging: (isDragging) => set({ isDragging }),
  setCurrentVideoId: (id) => set({ currentVideoId: id }),
  setIsVideoSelected: (id) => set({ isVideoSelected: id }),
  toggleVideoPlayback: () => {
    set((state) => ({
      videos: state.videos.map((video) => ({
        ...video,
        isPlaying: !state.videos[0].isPlaying, // Use first video's state as reference
      })),
    }));
  },

  // Remove individual video toggle since we want all to play together
  playAllVideos: () => {
    set((state) => ({
      videos: state.videos.map((video) => ({
        ...video,
        isPlaying: true,
      })),
    }));
  },

  pauseAllVideos: () => {
    set((state) => ({
      videos: state.videos.map((video) => ({
        ...video,
        isPlaying: false,
      })),
    }));
  },
  // toggleVideoPlayback: (videoId) =>
  //   set((state) => ({
  //     videos: state.videos.map((video) => (video.id === videoId ? { ...video, isPlaying: !video.isPlaying } : video)),
  //   })),
}));
