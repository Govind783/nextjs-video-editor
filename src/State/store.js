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
      startTime: 0,
      playbackOffset: 0,
      endTime: videoData.endTime || videoData.duration,
      isPlaying: false,
      isDragging: false,
      speed: 1,
      volume: 100,
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

  // updateVideoSpeed: (id, speed) =>
  //   set((state) => ({
  //     videos: state.videos.map((v) => (v.id === id ? { ...v, speed } : v)),
  //   })),

  updateVideoSpeed: (id, newSpeed) =>
    set((state) => {
      const updatedVideos = state.videos.map((video) => {
        if (video.id === id) {
          const newDuration = video.originalDuration / newSpeed;

          const wasAtMax = video.endTime === video.duration;
          const newEndTime = wasAtMax ? newDuration : Math.min(video.endTime, newDuration);

          return {
            ...video,
            speed: newSpeed,
            duration: newDuration,
            endTime: newEndTime,
          };
        }
        return video;
      });

      const maxDuration = Math.max(...updatedVideos.map((v) => v.endTime));
      const maxTextDuration = Math.max(...state.texts.map((t) => t.endTime));

      return {
        videos: updatedVideos,
        duration: Math.max(maxDuration, maxTextDuration),
      };
    }),

  updateVideoVolume: (id, volume) =>
    set((state) => ({
      videos: state.videos.map((v) => (v.id === id ? { ...v, volume } : v)),
    })),

  pauseAllVideos: () => {
    set((state) => ({
      videos: state.videos.map((video) => ({
        ...video,
        isPlaying: false,
      })),
    }));
  },
  updateVideoTimes: (id, times) =>
    set((state) => {
      const video = state.videos.find((v) => v.id === id);
      if (!video) return state;

      const playbackOffset = times.playbackOffset ?? video.playbackOffset ?? 0;

      return {
        videos: state.videos.map((v) =>
          v.id === id
            ? {
                ...v,
                ...times,
                playbackOffset,
                startTime: 0,
              }
            : v
        ),
      };
    }),

  syncVideoPlayback: (currentTime) =>
    set((state) => ({
      videos: state.videos.map((video) => ({
        ...video,
        playbackOffset: currentTime,
      })),
    })),

  resetBackAllVideos: () => {
    set((state) => {
      const newVideos = state.videos.map((v) => {
        return {
          ...v,
          startTime: 0,
          endTime: v.originalDuration,
          duration: v.originalDuration,
          speed: 1,
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
      const video = state.videos.find((v) => v.id === state.currentVideoId);
      const newTime = Math.min(state.currentTime + 10, state.duration);

      if (state.playerRef) {
        state.playerRef.currentTime = newTime * video.speed;
      }

      return {
        currentTime: newTime,
      };
    });
  },

  rewindVideo: () => {
    set((state) => {
      const video = state.videos.find((v) => v.id === state.currentVideoId);
      const newTime = Math.max(state.currentTime - 10, 0);

      if (state.playerRef) {
        state.playerRef.currentTime = newTime * video.speed;
      }
      return {
        currentTime: newTime,
      };
    });
  },

  deleteVideo: (ID) => {
    set((state) => {
      return {
        videos: state.videos.filter((i) => i.id !== ID),
      };
    });
  },

  // TEXTS
  selectedTextId: "", // similar to isVideoSelected, jusy as how isVideoSelected holds the id of the selected video this one holds the id of the selected text
  texts: [],
  textIsDragging: false,
  currentTextTime: 0,

  addTextsOnTL: (text, hasBG = false, containerWidth) => {
    const newTextObject = {
      id: uuidv4(),
      description: text,
      opacity: 100,
      x: containerWidth.width / 2,
      y: containerWidth.height / 2,
      fontSize: 18,
      duration: 20,
      endTime: 20,
      startTime: 0,
      color: "#ffffff",
      backgroundColor: hasBG,
      padding: 8,
      fontWeight: "normal",
      width: 200,
      height: 40,
    };

    set((state) => {
      const newTexts = [...state.texts, newTextObject];
      return {
        texts: newTexts,
      };
    });
  },

  deleteTextFromTL: (ID) =>
    set((state) => ({
      texts: state.texts.filter((t) => t.id !== ID),
    })),

  setSelectedText: (ID) => set({ selectedTextId: ID }),

  updateTextPosition: (id, x, y) =>
    set((state) => ({
      texts: state.texts.map((text) => (text.id === id ? { ...text, x, y } : text)),
    })),

  updateTextStyle: (ID, styleObject) => {
    set((state) => {
      const newTexts = state.texts.map((i) => {
        if (i.id === ID) {
          return {
            ...i,
            ...styleObject,
          };
        } else {
          return i;
        }
      });
      return {
        texts: newTexts,
      };
    });
  },

  updateTextsTime: (ID, endTime) => {
    set((state) => {
      const newTexts = state.texts.map((text) => {
        if (text.id === ID) {
          const newDuration = endTime - text.startTime;
          return {
            ...text,
            endTime,
            duration: newDuration,
            playbackOffset: state.currentTime,
          };
        }
        return text;
      });

      // Update global duration if text extends beyond current duration
      const maxTextDuration = Math.max(...newTexts.map((t) => t.endTime));
      const maxVideoDuration = Math.max(...state.videos.map((v) => v.duration));
      const newDuration = Math.max(maxTextDuration, maxVideoDuration);

      return {
        texts: newTexts,
        duration: newDuration,
      };
    });
  },

  syncTextPlayback: (currentTime) =>
    set((state) => ({
      texts: state.texts.map((text) => ({
        ...text,
        playbackOffset: currentTime,
      })),
    })),

  resetTexts: () =>
    set((state) => {
      const newTexts = state.texts.map((text) => ({
        ...text,
        startTime: 0,
        endTime: text.originalDuration,
        duration: text.originalDuration,
      }));
      return { texts: newTexts };
    }),

  setTextIsDragging: (isDragging) => set({ textIsDragging: isDragging }),

  // images
  images: [],
  selectedImageId: "",

  addImageOnTL: (imageData, containerWidth) => {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    if (imageData.size > MAX_SIZE) {
      return false;
    }

    const newImage = {
      id: uuidv4(),
      src: URL.createObjectURL(imageData),
      x: containerWidth.width / 2,
      y: containerWidth.height / 2,
      width: 200,
      height: 200,
      borderRadius: 0,
      startTime: 0,
      endTime: 20,
      duration: 20,
      opacity: 100,
    };

    set((state) => ({
      images: [...state.images, newImage],
    }));
    return true;
  },

  deleteImageFromTL: (ID) =>
    set((state) => ({
      images: state.images.filter((i) => i.id !== ID),
    })),

  setSelectedImage: (ID) => set({ selectedImageId: ID }),

  updateImagePosition: (id, x, y) =>
    set((state) => ({
      images: state.images.map((img) => (img.id === id ? { ...img, x, y } : img)),
    })),

  updateImagesTime: (ID, endTime) => {
    set((state) => {
      const newImages = state.images.map((image) => {
        if (image.id === ID) {
          const newDuration = endTime - image.startTime;
          return {
            ...image,
            endTime,
            duration: newDuration,
            playbackOffset: state.currentTime,
          };
        }
        return image;
      });

      // Update global duration if image extends beyond current duration
      const maxImageDuration = Math.max(...newImages.map((i) => i.endTime));
      const maxVideoDuration = Math.max(...state.videos.map((v) => v.duration));
      const maxTextDuration = Math.max(...state.texts.map((t) => t.endTime));

      return {
        images: newImages,
        duration: Math.max(maxImageDuration, maxVideoDuration, maxTextDuration),
      };
    });
  },

  syncImagePlayback: (currentTime) => {
    const newImages = state.images.map((image) => ({
      ...image,
      playbackOffset: currentTime,
    }));
    return {
      images: newImages,
    };
  },

  updateImageDimensions: (ID, w, h) => {
    set((state) => {
      const newImages = state.images.map((i) => {
        if (i.id === ID) {
          return {
            ...i,
            width: w,
            height: h,
          };
        } else {
          return i;
        }
      });
      return {
        images: newImages,
      };
    });
  },

  updateImageStyle: (ID, newStyle) => {
    set((state) => {
      const newImages = state.images.map((i) => {
        if (i.id === ID) {
          return {
            ...i,
            ...newStyle,
          };
        } else {
          return i;
        }
      });
      return {
        images: newImages,
      };
    });
  },
}));
