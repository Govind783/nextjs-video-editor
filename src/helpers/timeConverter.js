// utils/timeline.js
export const timeMsToUnits = (timeMs, zoom) => {
  return timeMs * zoom;
};

export const unitsToTimeMs = (units, zoom) => {
  return units / zoom;
};
