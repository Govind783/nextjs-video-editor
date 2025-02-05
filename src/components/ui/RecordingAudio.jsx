"use client";
import { Mic, Pause, Play, Trash } from "lucide-react";
import { useState, useEffect, useRef, memo } from "react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { useVideoStore } from "@/State/store";
import { toast } from "@/hooks/use-toast";

const  RecordAudio = memo(({ visualizerBars = 48, className, setIsOpen }) => {
  const [submitted, setSubmitted] = useState(false);
  const [timerForRecordedAudiosDuration, setTimerForRecordedAudiosDuration] = useState(0);
  const timeDurationOfSpecificAudioReciording = useRef(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recordings, setRecordings] = useState([]);
  const canvasRef = useRef(null);
  const audioRefs = useRef({});
  const addAudioOnTLGlobalMethod = useVideoStore((state) => state.addAudioOnTL);

  useEffect(() => {
    checkInitialPermissionState();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const checkInitialPermissionState = async () => {
    try {
      const result = await navigator.permissions.query({ name: "microphone" });
      if (result.state === "denied") {
        setPermissionDenied(true);
      }
    } catch (error) {
      console.error("Error checking permission:", error);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings((prev) => [
          ...prev,
          {
            url: audioUrl,
            duration: timeDurationOfSpecificAudioReciording.current,
            isPlaying: false,
            tempID: uuidv4(), // temp bcoz we will delete this on the final stage and let our method in store assign it and store assigns id and hence we delete this tempID
          },
        ]);

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        chunksRef.current = [];
      };

      return true;
    } catch (error) {
      console.error("Error getting microphone permission:", error);
      setPermissionDenied(true);
      return false;
    }
  };

  useEffect(() => {
    let intervalId;

    if (submitted) {
      intervalId = setInterval(() => {
        setTimerForRecordedAudiosDuration((prevTime) => {
          const newTime = prevTime + 1;

          if (newTime >= 594) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            toast({
              title: "The maximum duration for recording is 10 minutes",
              variant: "destructive",
            });
            return prevTime;
          }
          return newTime;
        });
      }, 1000);
    } else {
      timeDurationOfSpecificAudioReciording.current = timerForRecordedAudiosDuration;
    }

    return () => clearInterval(intervalId);
  }, [submitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = async () => {
    if (submitted) {
      setSubmitted(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } else {
      const permitted = await requestMicrophonePermission();
      if (permitted) {
        setSubmitted(true);
        setTimerForRecordedAudiosDuration((prev) => (prev ? 0 : prev));
        timeDurationOfSpecificAudioReciording.current = 0;
        mediaRecorderRef.current.start();
      }
    }
  };

  const togglePlayPause = (index) => {
    const audio = audioRefs.current[index];
    if (!audio) return;

    setRecordings((prevRecordings) => {
      const newRecordings = [...prevRecordings];
      newRecordings[index] = {
        ...newRecordings[index],
        isPlaying: !newRecordings[index].isPlaying,
      };

      if (newRecordings[index].isPlaying) {
        audio.play();
      } else {
        audio.pause();
      }

      return newRecordings;
    });
  };


  useEffect(() => {
    if (!canvasRef.current || recordings.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const minWidth = 600;
    const height = 40;
    const padding = 10;

    const totalWidth = minWidth + padding * 2;

    canvas.width = totalWidth * dpr;
    canvas.height = (height * recordings.length + padding * (recordings.length + 1)) * dpr;

    ctx.scale(dpr, dpr);

    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${height * recordings.length + padding * (recordings.length + 1)}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let yOffset = padding;
    recordings.forEach((recording, index) => {
      // Draw the rectangle
      ctx.fillStyle = "#090c12"; // Original dark color (bg-gray-900)
      ctx.beginPath();
      ctx.roundRect(padding, yOffset, minWidth, height, 4);
      ctx.fill();

      // Darker border (gray-700)
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Text
      ctx.fillStyle = "#6B7280";
      ctx.font = "14px sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(`Recording ${index + 1}`, padding + 15, yOffset + height / 2);

      yOffset += height + padding;
    });
  }, [recordings]);

  if (permissionDenied) {
    return (
      <div className="text-gray-600  mt-8 mb-4 text-base text-center">
        You have denied microphone permission
        <br />
        Go to Chrome settings to re-enable
      </div>
    );
  }
  const deleteAudioClip = (ID) => {
    setRecordings((prev) => {
      const prevState = [...prev];
      return prevState.filter((i) => i.tempID !== ID);
    });
  };

  const addNewlyRecordedAudioClipsToTL = () => {
    // delete isPlaying and tempID
    recordings.map((item) => {
      console.log(item);
      delete item.tempID;
      const newobject = {
        src: item.url,
        duration: item.duration,
      };

      addAudioOnTLGlobalMethod(newobject);
    });
    setIsOpen(false)
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-[47rem] w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
            submitted ? "bg-none" : "bg-none hover:bg-black/10 dark:hover:bg-white/10"
          )}
          type="button"
          onClick={handleClick}
        >
          {submitted ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-black dark:bg-white cursor-pointer pointer-events-auto"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="w-6 h-6 text-black/70 dark:text-white/70" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            submitted ? "text-black/70 dark:text-white/70" : "text-black/30 dark:text-white/30"
          )}
        >
          {formatTime(timerForRecordedAudiosDuration)}
        </span>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-100",
                submitted ? "bg-black/50 dark:bg-white/50 " : "bg-black/10 dark:bg-white/10 h-1"
              )}
              style={
                submitted
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        {recordings.length > 0 && (
          <>
            <div className="w-full mt-4 flex items-center">
              <div className="flex flex-col gap-3 mt-2">
                {recordings.map((recording, index) => {
                  // Create audio element for each recording
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex items-cemter ">
                        <button
                          onClick={() => deleteAudioClip(recording.tempID)}
                          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <Trash className="!w-5 h-5" />
                        </button>
                        <button
                          onClick={() => togglePlayPause(index)}
                          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          {recording.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                      </div>

                      <audio
                        ref={(el) => (audioRefs.current[index] = el)}
                        src={recording.url}
                        onEnded={() => {
                          setRecordings((prev) => {
                            const newRecordings = [...prev];
                            newRecordings[index].isPlaying = false;
                            return newRecordings;
                          });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <canvas ref={canvasRef} className="w-full" style={{ maxWidth: "100%", height: "auto" }} />
            </div>
            <div className="w-full flex justify-start mt-4 ml-8 mr-0">
              <Button onClick={addNewlyRecordedAudioClipsToTL} className="w-[89%]">
                Use audio clips
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
})
RecordAudio.displayName  = 'RecordAudio'

export default RecordAudio