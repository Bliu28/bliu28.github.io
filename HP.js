

const images = [
    { src: "headphone.png", alt: "Headphone" },
    { src: "HPblack.png", alt: "Black Background Headphone" },
    { src: "HPexploded.png", alt: "Headphone Exploded View" },
];

const enlargedImage = document.getElementById("enlargedImage");
const thumbnails = document.querySelectorAll(".thumbnail");
const body = document.querySelector('body');


// Loop through each thumbnail and add a click event listener
thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", () => {
        // Set the enlarged image's source to the clicked thumbnail's source
        enlargedImage.src = thumbnail.src;
        enlargedImage.style.display = 'block'; // Display the enlarged image
    });
});

body.addEventListener("click", (event) => {
    // Check if the clicked target is not a thumbnail or the enlarged image
    if (!event.target.classList.contains('thumbnail') && event.target.id !== 'enlargedImage') {
        enlargedImage.style.display = 'none'; // Hide the enlarged image
    }
});
document.getElementById("Cat").addEventListener("click", function() {
    window.location.href = "index.html";  // Redirects to the new page
});


