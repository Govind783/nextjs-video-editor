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
  duration: 0, // the duration of the longest video, so u uploaed 4 videoes 1min, 4min and 10mins long, duration would be 10mins in seconmds
  currentTime: 0, // this updates based on the duration of the longest video so lets say 240s were todtal u play for 1min, then this becomes 60
  fps: 30,
  // scrollLeft: 0, /// dont need this  (for now, or maybe forevver, made this state local and it does work, so idk maybe delete, keep for now)

  isDragging: false,
  playerRef: null,
  isVideoPlaying: false, // one single bool for deciing if video is playing or not, we dont need diff states for diff videos lets keep one single bool/state which will be linked to the longest video

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
    const MAX_DURATION = 1500; // 1800 can be handled but for safe side im doing 1500

    if (videoData.duration > MAX_DURATION) {
      return false;
    }

    // this liomit is needed rn bcoz browsers have a hard limit on = 16384px of canvas width and hence u cannot zoom in zoom out till the last second and hence i also commented out the zoom in zoom out thig, todo work on thjis later
    const newVideo = {
      id: uuidv4(),
      src: URL.createObjectURL(videoData.videoBlob),
      originalDuration: videoData.duration,
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
      isVideoPlaying: !state.isVideoPlaying,
      // videos: state.videos.map((video) => ({
      //   ...video,
      //   isPlaying: !state.videos[0].isPlaying, // Use first video's state as reference
      // })),
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
  updateVideoTimes: (id, times) =>
    set((state) => ({
      videos: state.videos.map((v) =>
        v.id === id
          ? {
              ...v,
              ...times,
            }
          : v
      ),
    })),

  resetBackAllVideos: () => {
    set((state) => {
      const newVideos = state.videos.map((v) => {
        return {
          ...v,
          startTime: 0,
          endTime: v.originalDuration,
          duration: v.originalDuration,
        };
      });
      return {
        videos: newVideos,
        duration: Math.max(...newVideos.map((i) => i.originalDuration)),
      };
    });
  },

  // reason we cannot simply use this and need to update and rey on ref is bcoz in the VideoEditor comp, we are updating the current time, so if we update the curentTime from header on click, along with the editor component always updating it thers a clash and a race condition as 2 compoennts are trying to update the same thing at the same time
  // forwardVideo: () => {
  //   set((state) => {
  //     return {
  //       currentTime: Math.min(state.currentTime + 10, state.duration),
  //     };
  //   });
  // },

  forwardVideo: () => {
    set((state) => {

      const newTime = Math.min(state.currentTime + 10, state.duration);

      if (state.playerRef) {
        state.playerRef.currentTime = newTime;
      }

      return {
        currentTime: newTime,
      };
    });
  },

  rewindVideo: () => {
    set((state) => {
      const newTime = Math.max(state.currentTime - 10, 0);

      if (state.playerRef) {
        state.playerRef.currentTime = newTime;
      }
      return {
        currentTime: newTime,
      };
    });
  },

  // toggleVideoPlayback: (videoId) =>
  //   set((state) => ({
  //     videos: state.videos.map((video) => (video.id === videoId ? { ...video, isPlaying: !video.isPlaying } : video)),
  //   })),
}));
