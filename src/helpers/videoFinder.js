export const findVideoAndUpdatTime = () => {
    const cache = {}
    return(vidID) => {
      if(!cache[vidID]){
       cache[vidID] =  document.querySelector(`div[data-id="${vidID}"] > video`)
      }
      return cache[vidID]
    }
  }
