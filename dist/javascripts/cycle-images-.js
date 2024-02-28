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
    let currentIndex = 0;
    if (!images || !nextImage || !lastImage) {
        return;
    }
    nextImage.addEventListener('click', function () {
        // Hide current image
        images[currentIndex].style.display = 'none';
        // Move to the next image
        currentIndex = (currentIndex + 1) % images.length;
        // Show next image
        images[currentIndex].style.display = 'block';
    });
    lastImage.addEventListener('click', function () {
        // Hide current image
        images[currentIndex].style.display = 'none';
        // Move to the next image
        currentIndex = currentIndex - 1 < 0 ? images.length : (currentIndex - 1) % images.length;
        // Show next image
        images[currentIndex].style.display = 'block';
    });
    images.forEach((image) => {
        image.style.display = 'block';
    });
}
export {};