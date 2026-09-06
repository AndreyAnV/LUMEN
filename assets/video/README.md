# Hero video

The MP4 is intentionally absent. The site renders the local WebP poster immediately.

To add a video, save an optimized, silent H.264 MP4 as `assets/video/hero-dental.mp4`.
Use a short loop, preferably below 4 MB, with the MP4 fast-start flag enabled.
On HTTP, JavaScript checks that the file exists before playing. Reduced motion,
Save-Data and 2G connections keep the poster. Direct file opening also keeps the poster.

Replace `assets/images/hero-poster.webp` to change the still image. The duplicate
`assets/video/hero-poster.webp` is included for compatibility with the original brief;
the website uses the image in `assets/images/` as its canonical poster.
