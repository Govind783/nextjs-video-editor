export const findVideoAndUpdatTime = () => {
  const cache = {};
  return (vidID) => {
    if (!cache[vidID]) {
      cache[vidID] = document.querySelector(`div[data-id="${vidID}"] > video`);
    }
    return cache[vidID];
  };
};

export const findAudioInDOM = () => {
  const cache = {};
  return (AID) => {
    if (!cache[AID]) {
      cache[AID] = document.querySelector(`audio[data-id="${AID}"]`);
    }
    return cache[AID];
  };
};

export const isObjectEmpty = (obj) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false; 
    }
  }
  return true;
};
