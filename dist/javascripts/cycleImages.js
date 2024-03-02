if (document.readyState !== "loading") {
  initializeImageCycler();
}
else {
  document.addEventListener("DOMContentLoaded", function () {
    initializeImageCycler();
  });
}
function initializeImageCycler() {
  const nextImage = document.getElementById('next-image');
  const lastImage = document.getElementById('last-image');
  const images = document.querySelectorAll('#image-list li');
  if (!images || !nextImage || !lastImage) {
    return;
  }
  let currentIndex = images.length > 0 ? images.length - 1 : 0;
  nextImage.addEventListener('click', function () {
    images[currentIndex].style.display = 'none';
    currentIndex = (currentIndex + 1) % images.length;
    images[currentIndex].style.display = 'block';
  });
  lastImage.addEventListener('click', function () {
    images[currentIndex].style.display = 'none';
    currentIndex = currentIndex - 1 < 0 ?
      images.length - 1 : (currentIndex - 1) % images.length;
    images[currentIndex].style.display = 'block';
  });
  images.forEach((image, index) => {
    if (index === currentIndex) {
      image.style.display = 'block';
    }
    else {
      image.style.display = 'none';
    }
  });
  images[currentIndex].style.display = 'block';
}
