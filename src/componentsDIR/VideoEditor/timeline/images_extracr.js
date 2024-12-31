var images = document.getElementsByTagName("img"),
  i,
  imageUrls = [],
  imageUrlString = "";

for (i = 0; i < images.length; i++) {
  if (imageUrls.indexOf(images[i].getAttribute("src")) == -1) {
    imageUrls[i] = images[i].getAttribute("src");
    imageUrlString += images[i].getAttribute("src") + "<br/>";
  }
}

console.log(imageUrlString);

imageUrlString.split("<br/>")
