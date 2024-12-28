// Main format time function - formats seconds to HH:MM:SS or MM:SS
export const formatTime = (timeInSeconds) => {
  if (!timeInSeconds) return "00:00";

  timeInSeconds = Math.floor(timeInSeconds);

  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;

  // If video is longer than an hour, show hours
  if (hours > 0) {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  }

  // Otherwise just show minutes and seconds
  return `${padZero(minutes)}:${padZero(seconds)}`;
};

// Helper to pad single digits with leading zero
const padZero = (num) => {
  return num.toString().padStart(2, "0");
};

// For timeline units (returns different formats based on duration)
export const formatTimelineUnit = (time) => {
  if (time < 60) {
    // Under a minute
    // Format to 1 decimal place for seconds
    return `${Number(time).toFixed(0)}s`;
  } else if (time < 3600) {
    // Under an hour
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${padZero(seconds)}`;
  } else {
    // Over an hour
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    return `${hours}:${padZero(minutes)}`;
  }
};
