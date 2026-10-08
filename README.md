# IMAGING SCIENCE WEBSITE

This website is based on a Vue.js frontend with a FastAPI backend, and is designed to render most transforms and filters used in my "Imaging Science" lecture. It is done using an interactive canvas (Fabric.js based) where objects and images are rendered, and then a series of buttons that render different operations on the image. The operations are done on the backend, using a mixture of numpy, scipy and PyWavelets. The render is exclusively on grayscale to avoid the struggle of multichannel images.

## Features
- Edge detection using Canny's algorithm.
- Corner Detection
- Morphological Filters (Erosion, Dilation, Top Hats...)
- Denoising Filters (Diffusion Filter, NL-Means, Median Filter)
- Frequency Filters (Highpass, Lowpass) both in the Spatial Domain (convolving with Gaussian) and in the Fourier Domain (both hard cutoff and butterworth cutoff)
- Transforms (FFT, IFFT, DCT, IDCT, DWT)
- The ability to import images, shapes, and draw with your own brush. Some shapes include: Rects, Ellipses, Checkerboard patterns, sinusoidal shapes, gaussians, etc.
- Histogram Equalization, Gamma Correction, Affine Grayscale Transformations, etc...
- Global Variational Filters computed as a minimization of an energy functional.
- Visualization of the Mean, Variance and Histogram of the image

## Explanation
To ensure the accuracy of the transforms and filters, instead of relying on the canvas.getImageData() (which is affected by anti-aliasing and more), all objects have their own custom rasterization algorithms onto a 32-bit imageBuffer, to ensure accuracy of the numbers and not be limited by 8 bits. Imported Images don't get a jump in accuracy (given that they were stored in 8 bits from the beginning) , but custom shapes like gaussians are preserved much better, so artifacts are minimized. This is because even though Gaussians are treated as simple images in the fabric canvas, they have some custom properties added to their fabric object so that when syncing the ImageBuffer, we can compute the actual value to a much higher accuracy. 

There are multiple custom shapes:
- Gaussians
- Sinusoidal shapes
- Checkerboard pattern
- Grid pattern

Each of these transforms and filters allow to customize the parameters with it's inputs, so that you can tweak the thresholds of edge detection, the variance and mean of the frequency filters, etc. The updated filter/transform is requested as soon as an input is changed.

The canvas is also able to be resize to different settings, either the entire available screen, a factor of 2, or to fit the existing objects on the screen (to prevent wrap-around errors). 

This is currently still a Work In Progress and is not finished, so lots of bugs are to be expected.

## Try it out!
Try it out [here](https://voranto.nat.selfnet.de/imaging/)

## Local deployment
```
git clone https://github.com/Voranto/Imaging-Science-Project.git
cd Imaging-Science-Project
```

To deploy the frontend
```
npm install
npm run dev
```

To deploy the backend
```
cd ImagingScience
uv sync --frozen
uv run fastapi dev src/project/main.py
```

## Examples
### Edge/Corner Detection
<table align="center">
  <tr>
    <td align="center">
      <p><b>Original Image</b></p>
      <img width="1117" height="797" alt="image" src="https://github.com/user-attachments/assets/6e203089-b326-4b02-a0f3-1876bb212a12" />
    </td>
    <td align="center">
      <p><b>Simple Edge Detector</b></p>
      <img width="1117" height="797" alt="image" src="https://github.com/user-attachments/assets/001b4efb-b18b-470d-a526-ff92b00a5703" />
    </td>
  </tr>
  <tr>
    <td align="center">
      <p><b>Canny's Edge Detector</b></p>
      <img width="1117" height="797" alt="image" src="https://github.com/user-attachments/assets/c33d8261-3e01-47d7-b487-e1454d532c6e" />
    </td>
    <td align="center">
      <p><b>Corner Detection (Tomasi/Kanade)</b></p>
      <img width="1120" height="797" alt="image" src="https://github.com/user-attachments/assets/810cc446-305b-4a2b-bc78-037c9d39b0ed" />
    </td>
    
  </tr>
</table>

### Denoising
<table align="center">
  <tr>
    <td align="center">
      <p><b>Original Image</b></p>
      <img width="1117" height="797" alt="image" src="https://github.com/user-attachments/assets/6e203089-b326-4b02-a0f3-1876bb212a12" />
    </td>
    <td align="center">
      <p><b>Salt-and-Pepper noise, 33% probability</b></p>
      <img width="1112" height="796" alt="image" src="https://github.com/user-attachments/assets/78cfdc6e-3a98-4f79-96a0-d0be4cb8d129" />
    </td>
  </tr>
  <tr>
    <td align="center">
      <p><b>Regular lowpass filter, sensitive to the outliers</b></p>
      <img width="1117" height="761" alt="image" src="https://github.com/user-attachments/assets/1ca1925e-1031-402f-b287-c3459b686cd3" />
    </td>
    <td align="center">
      <p><b>Median Filter with radius 2</b></p>
      <img width="1112" height="761" alt="image" src="https://github.com/user-attachments/assets/5d7a40ab-b399-49af-b140-c55c5a0291b9" />
    </td>
  </tr>
</table>

### Transforms
<table align="center">
  <tr>
    <td align="center">
      <p><b>Circle</b></p>
      <img width="640" height="643" alt="image" src="https://github.com/user-attachments/assets/5f60681c-4f55-4226-8255-c7655fa00012" />
    </td>
    <td align="center">
      <p><b>Fourier Spectrum</b></p>
      <img width="642" height="642" alt="image" src="https://github.com/user-attachments/assets/fae69bd9-3f7b-4d31-9ad3-20fc3feb55cf" />
    </td>
  </tr>
</table>

<table align="center">
  <tr>
    <td align="center">
      <p><b>Original Image</b></p>
      <img src="https://github.com/user-attachments/assets/52568991-b793-4241-bda4-24c916f8f037" width="300" />
    </td>
    <td align="center">
      <p><b>Fourier Spectrum</b></p>
      <img src="https://github.com/user-attachments/assets/30408597-802a-426d-ad27-7225937f4b83" width="300" />
    </td>
  </tr>
  <tr>
    <td align="center">
      <p><b>Removing Higher Frequencies with a hard cutoff (not ideal)</b></p>
      <img src="https://github.com/user-attachments/assets/e26124e5-4d35-435c-abca-dcf07e61c5b4" width="300" />
    </td>
    <td align="center">
      <p><b>IFFT (Ringing Artifacts)</b></p>
      <img src="https://github.com/user-attachments/assets/7b16c283-edd6-429f-b890-1b46c256aac1" width="300" />
    </td>
  </tr>
  <tr>
    <td align="center">
      <p><b>Removing Higher Frequencies with a butterworth cutoff </b></p>
      <img width="300" alt="image" src="https://github.com/user-attachments/assets/91c88a35-d000-44fa-8593-283d8e41bb11" />
    </td>
    <td align="center">
      <p><b>IFFT (Much better lowpass filter)</b></p>
      <img width="300" alt="image" src="https://github.com/user-attachments/assets/2ea9b114-c251-4348-97ee-c4c7dded9a16" />
    </td>
  </tr>
</table>

<table align="center">
  <tr>
    <td align="center">
      <p><b>Original Image</b></p>
        <img width="1190" height="792" alt="image" src="https://github.com/user-attachments/assets/af531489-dd87-402a-b3f7-315bb2f59d9a" />
    </td>
    <td align="center">
      <p><b>Discrete Wavelet Transform (1 level)</b></p>
        <img width="1192" height="792" alt="image" src="https://github.com/user-attachments/assets/30d8cf8f-83d3-49a1-9159-e4b157cb9fec" />
    </td>
  </tr>
</table>

### AI USAGE
AI has been exclusively used for the CSS design, nothing else, as I am too bad of a graphic designer to go through the effort of aligning divs.
