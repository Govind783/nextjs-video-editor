// const LONG_TICK = 18;
// const SHORT_TICK = 6;

// self.onmessage = ({ data }) => {
//   const { identifier, scrollLeft, scale, minRange, maxRange, endUnit, zoomUnit, width, version } = data;

//   console.log(`[Worker] Received message: Version ${version}, Scale ${scale.unit}, ScrollLeft ${scrollLeft}`);

//   if (identifier === "ruler") {
//     const timeLabels = [];
//     const ticks = [];

//     for (let i = 0; i <= endUnit; i++) {
//       const value = i + minRange;
//       if (value < 0) continue;

//       const startValue = value * zoomUnit;
//       const startPos = startValue - scrollLeft + 40;

//       // Format time labels
//       const timeText = formatTimelineUnit(value * scale.unit);
//       timeLabels.push({ text: timeText, position: startPos });

//       // Calculate ticks
//       for (let j = 0; j < scale.segments; j++) {
//         const pos = startPos + (j / scale.segments) * zoomUnit;
//         if (pos < 0 || pos >= width) continue;

//         const tickHeight = j % scale.segments ? SHORT_TICK : LONG_TICK;
//         ticks.push({ position: pos, tickHeight });
//       }
//     }

//     console.log(`[Worker] Computation complete for Version ${version}`);
//     self.postMessage({
//       identifier: "ruler",
//       payload: { timeLabels, ticks, version },
//     });
//   }
// };

// const formatTimelineUnit = (time) => {
//   if (time < 60) {
//     return `${Number(time).toFixed(0)}s`;
//   } else if (time < 3600) {
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${minutes}:${padZero(seconds)}`;
//   } else {
//     const hours = Math.floor(time / 3600);
//     const minutes = Math.floor((time % 3600) / 60);
//     return `${hours}:${padZero(minutes)}`;
//   }
// };

// const padZero = (value) => (value < 10 ? `0${value}` : value);
