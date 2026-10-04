# IMAGING SCIENCE WEBSITE

This website is based on a Vue.js frontend with a FastAPI backend, and is designed to render most transforms and filters used in my "Imaging Science" lecture. It is done using an interactive canvas (Fabric.js based) where objects and images are rendered, and then an assortment of buttons that render different operations on the image. The operations are done on the backend, using a mixture of numpy, scipy and PyWavelets. The render is exclusively on grayscale to avoid the struggle of multichannel images. Some features include: 
- Edge detection using Canny's algorithm.
- Corner Detection
- Morphological Filters (Erosion, Dilation, Top Hats...)
- Denoising Filters (Diffusion Filter, NL-Means, Median Filter)
- Frequency Filters (Highpass, Lowpass) both in the Spatial Domain (convolving with Gaussian) and in the Fourier Domain (both hard cutoff and butterworth cutoff)
- Transforms (FFT, IFFT, DCT, IDCT, DWT)
- The ability to import images, shapes, and draw with your own brush. Some shapes include: Rects, Ellipses, Checkerboard patterns, sinusoidal shapes, gaussians, etc.
- Histogram Equalization, Gamma Correction, Affine Grayscale Transformations, etc...
- Visualization of the Mean, Variance and Histogram of the image
To ensure the accuracy of the transforms and filters, instead of relying on the canvas.getImageData() (which is affected by anti-aliasing and more), all objects have their own custom rasterization algorithms onto a 32-bit imageBuffer, to ensure accuracy of the numbers and not be limited by 8 bits. Imported Images don't get a jump in accuracy (given that they were stored in 8 bits from the beginning, but custom shapes like gaussians are preserved much better, so artifacts are minimized.

Each of these transforms and filters allow to customize the parameters with it's inputs, so that you can tweak the thresholds of edge detection, the variance and mean of the frequency filters, etc. 

This is currently still a Work In Progress and is not finished, so lots of bugs are to be expected. The UI is also not finished, some some elements may look out of place.

### AI USAGE
AI has been exclusively used for the CSS design, nothing else, as I am too bad of a graphic designer to go through the effort of aligning divs.
