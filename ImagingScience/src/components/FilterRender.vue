<script setup>
import { ref } from 'vue';
import { updateCurrentFilter, renderFilterToCanvas, optimalAffineGrayscaleTransform, affineGrayscaleSlope, affineGrayscaleDistance } from '../composables/filters/useFilter.ts'
import { filterImageSrc, filterRequested, getFilterType } from "../composables/filters/FilterType.ts"
import { Filter } from '@/composables/filters/Filter.ts';
import { changeFilterType } from '@/composables/filters/FilterType.ts';

const thresholdSimpleEdge = ref(50)
const thresholdCannyWeak = ref(50)
const thresholdCannyStrong = ref(100)

const highpassFilterSigma = ref(1)
const lowpassFilterSigma = ref(1)
const gammaCorrectionValue = ref(1.0)

const cornerSigma = ref(2);
const cornerRho = ref(4);
const cornerThreshold = ref(20);

const morphologicalFilters = ["dilation","erosion","opening","closing","whiteTopHat","blackTopHat","selfdualTopHat","medianFilter"]
const morphologicalRadius = ref(1);
const medianRadius = ref(1);

const waveletShrinkageMode = ref("hard");
const waveletShrinkageThreshold = ref(1);

const bilateralSigmaSpatial = ref(1);
const bilateralSigmaTonal = ref(1);

const NLMeansRadiusPatch = ref(3);
const NLMeansRadiusWindow = ref(10);
const NLMeansStrength = ref(3);

const diffusionContrast = ref(10);
const diffusionTime = ref(10);
const diffusionOption = ref(1);
</script>

<template>
  <div class="overlay-screen">
    <header class="toolbar">
      <div class="toolbar-actions">
        <button class="btn btn-secondary" @click="filterRequested = false">
          Close
        </button>
        <button class="btn btn-primary" @click="renderFilterToCanvas">
          Paint Filter To Canvas
        </button>
      </div>

      <select name="filterType" id="filterType" style="display: none;">
        <option value="none" selected="selected">none</option>
        <option value="simpleEdge">simpleEdge</option>
        <option value="cannys">cannys</option>
        <option value="highpass">highpass</option>
        <option value="lowpass">lowpass</option>
        <option value="gammaCorrection">gammaCorrection</option>
        <option value="cornerTomasi">cornerTomasi</option>
        <option value="cornerRohr">cornerRohr</option>
        <option value="cornerHarris">cornerHarris</option>
        <option value="dilation">dilation</option>
        <option value="erosion">erosion</option>
        <option value="opening">opening</option>
        <option value="closing">closing</option>
        <option value="whiteTopHat">whiteTopHat</option>
        <option value="blackTopHat">blackTopHat</option>
        <option value="selfdualTopHat">selfdualTopHat</option>
        <option value="median">median</option>
        <option value="waveletShrinkage">waveletShrinkage</option>
        <option value="bilateral">bilateral</option>
        <option value="NLMeans">NLMeans</option>
        <option value="diffusion">diffusion</option>
        <option value="affineGrayscale">affineGrayscale</option>
        <option value="histogramEqualization">histogramEqualization</option>
      </select>
      </header>
      <div class="content-body">
        <main class="image-viewport">
          <div v-if="Filter.isLoading.value" class="loading-overlay">
              <div class="spinner"></div>
                <span>Processing image...</span>
                <button class="btn btn-danger btn-sm" @click="Filter.abortRequest()">
                  Abort current request
                </button>
            </div>
          <div class="image-wrapper" v-show="filterRequested">
            <img :src="filterImageSrc" id="filterImage" alt="Filter preview">
          </div>
        </main>

      <aside v-if="getFilterType() !== 'none'" class="sidebar-controls">
        <div v-show="getFilterType() == 'simpleEdge'" class="control-group">
          <h3>Simple Edge Detector</h3>
          <p class="filter-note">This edge detection is done by simply measuring the gradient using Sobel Operators and selecting edges as pixels with a gradient >= Threshold</p>
          <div class="input-row">
            <label>Threshold:</label>
            <input type="range" v-model.number="thresholdSimpleEdge" @change="updateCurrentFilter" id="simpleEdgeThreshold" min="0" max="250">
            <span class="threshold-value">{{ thresholdSimpleEdge }}</span>
          </div>
          <label class="checkbox-label">
            Apply Gaussian Smoothing
            <input type="checkbox" id="applyGaussianSimpleEdges" @change="updateCurrentFilter" checked>
          </label>
        </div>

        <div v-show="getFilterType() == 'cannys'" class="control-group">
          <h3>Canny's Edge Detector</h3>
          <p class="filter-note">This is a more refined version of the simple edge detector that achieves 1-pixel thick edges. For more info, visit <a href="https://en.wikipedia.org/wiki/Canny_edge_detector" target="_blank">Here</a></p>
          <div class="input-row">
            <label>Weak Threshold:</label>
            <input type="range" v-model.number="thresholdCannyWeak" @change="updateCurrentFilter" id="thresholdCannyWeak" min="0" max="250">
            <span class="threshold-value">{{ thresholdCannyWeak }}</span>
          </div>
          <div class="input-row">
            <label>Strong Threshold:</label>
            <input type="range" v-model.number="thresholdCannyStrong" @change="updateCurrentFilter" id="thresholdCannyStrong" min="0" max="250">
            <span class="threshold-value">{{ thresholdCannyStrong }}</span>
          </div>
          <label class="checkbox-label">
            Apply Gaussian Smoothing
            <input type="checkbox" id="applyGaussianCanny" @change="updateCurrentFilter" checked>
          </label>
        </div>

        <div v-show="getFilterType() == 'lowpass'" class="control-group">
          <h3>Lowpass Filter</h3>
          <p class="filter-note">This is a lowpass filter computed in the spatial domain by convolving the image with a Gaussian. It's goal is to reduce high-frequent noise by 'blurring' the image. A similar effect can be obtained by applying a frequency filter in the Fourier Domain.</p>
          <div class="input-row">
            <label>Variance:</label>
            <input type="range" v-model.number="lowpassFilterSigma" @change="updateCurrentFilter" id="lowpassFilterSigma" min="0" max="20">
            <span class="threshold-value">{{ lowpassFilterSigma }}</span>
          </div>
        </div>

        <div v-show="getFilterType() == 'highpass'" class="control-group">
          <h3>Highpass Filter</h3>
          <p class="filter-note">This is a highpass filter computed in the spatial domain by subtracting the original image from it's lowpass filter. Afterwards an Affine Grayscale Transformation has to be done, because there is a possibility of obtaining values outside the range [0,255]</p>
          <div class="input-row">
            <label>Variance:</label>
            <input type="range" v-model.number="highpassFilterSigma" @change="updateCurrentFilter" id="highpassFilterSigma" min="0" max="20">
            <span class="threshold-value">{{ highpassFilterSigma }}</span>
          </div>
        </div>

        <div v-show="getFilterType() == 'gammaCorrection'" class="control-group">
          <h3>Gamma Correction</h3>
          <div class="input-row">
            <label>Gamma:</label>
            <input type="range" v-model.number="gammaCorrectionValue" @change="updateCurrentFilter" id="gammaCorrectionValue" min="0.1" max="4.0" step="0.1">
            <span class="threshold-value">{{ gammaCorrectionValue }}</span>
          </div>
        </div>

        <div v-show="getFilterType()?.startsWith('corner')" class="control-group">
          <h3>Corner Detection</h3>
          <p class="filter-note">The corner detection is done via the structure tensor. The parameters sigma and rho represent the components of the gaussian in the structure tensor. Three different methods for checking a corner have been implemented here, each has a different algorithm to determine if a pixel is a corner</p>
          <div class="input-row">
            <label>Sigma:</label>
            <input type="range" v-model.number="cornerSigma" @change="updateCurrentFilter" id="cornerSigma" min="0.1" max="20" step="0.1">
            <span class="threshold-value">{{ cornerSigma }}</span>
          </div>
          <div class="input-row">
            <label>Rho:</label>
            <input type="range" v-model.number="cornerRho" @change="updateCurrentFilter" id="cornerRho" :min="cornerRho" max="20" step="0.1">
            <span class="threshold-value">{{ cornerRho }}</span>
          </div>
          <div class="input-row">
            <label>Threshold:</label>
            <input type="range" v-model.number="cornerThreshold" @change="updateCurrentFilter" id="cornerThreshold" min="0.1" max="250" step="0.1">
            <span class="threshold-value">{{ cornerThreshold }}</span>
          </div>
        </div>

        <div v-show="morphologicalFilters.includes(getFilterType())" class="control-group">
          <h3>Morphological Filters ({{ getFilterType() }})</h3>
          <p class="filter-note">These filters are mainly used to analyse the shapes of objects in an image.</p>
          <div class="input-row">
          <label>Radius:</label>
            <input type="range" v-model.number="morphologicalRadius" @change="updateCurrentFilter" id="morphologicalRadius" min="0" max="25" step="1">
            <span class="threshold-value">{{ morphologicalRadius }}</span>
          </div>
          <div class="input-row">
            <label>Mask Type:</label>
            <select class="custom-select" id="morphologicalMaskType" @change="updateCurrentFilter">
              <option value="circle">Circle</option>
              <option value="square">Square</option>
            </select>
          </div>
        </div>

        <div v-show="getFilterType() === 'median'" class="control-group">
          <h3>Median Filter</h3>
          <p class="filter-note">This filter is excellent against outliers, such as Salt and Pepper Noise (see Add -> Other Noises -> Impulse Noise).</p>
          
          <div class="input-row">
            <label>Radius:</label>
            <input type="range" v-model.number="medianRadius" @change="updateCurrentFilter" id="medianRadius" min="0" max="25" step="1">
            <span class="threshold-value">{{ medianRadius }}</span>
          </div>
        </div>

        <div v-show="getFilterType() === 'waveletShrinkage'" class="control-group">
          <h3>Wavelet Shrinkage</h3>
          <p class="filter-note">This filter works by downscaling the wavelet coefficients of small magnitude to try and reduce noise.</p>
          <div class="input-row">
            <label>Threshold:</label>
            <input type="range" v-model.number="waveletShrinkageThreshold" @change="updateCurrentFilter" id="waveletShrinkageThreshold" min="0" max="100" step="1">
            <span class="threshold-value">{{ waveletShrinkageThreshold }}</span>
          </div>
          <div class="input-row">
            <label>Wavelet Shrinkage Mode: </label>
            <select class="custom-select" v-model="waveletShrinkageMode" id="waveletShrinkageMode" @change="updateCurrentFilter">
              <option value="hard">hard</option>
              <option value="soft">soft</option>
              <option value="garrote">garrote</option>
            </select>
          </div>
        </div>

        <div v-show="getFilterType() === 'bilateral'" class="control-group">
          <h3>Bilateral Filtering</h3>
          <p class="filter-note">This filter works by doing a weighted averaging of nearby pixels, taking into account both distance and tonal similarity. These weights are passed through Gaussians, which are parameterized by the inputs below.</p>

          <div class="input-row">
            <label>Spatial Variance:</label>
            <input type="range" v-model.number="bilateralSigmaSpatial" @change="updateCurrentFilter" id="bilateralSigmaSpatial" min="0" max="50" step="1">
            <span class="threshold-value">{{ bilateralSigmaSpatial }}</span>
          </div>
          <div class="input-row">
            <label>Tonal Variance:</label>
            <input type="range" @dragstart.prevent v-model.number="bilateralSigmaTonal" @change="updateCurrentFilter" id="bilateralSigmaTonal" min="0" max="500" step="1">
            <span class="threshold-value">{{ bilateralSigmaTonal }}</span>
          </div>

        </div>

        <div v-show="getFilterType() === 'NLMeans'" class="control-group">
          <h3>Nonlocal Means</h3>
          <p class="filter-note">Similar to bilateral filtering, but we are only looking now at tonal similarity, and we look at entire neighborhoods.</p>

          <p class="filter-note">Note: Higher window Radius WILL increase render time.</p>
          <div class="input-row">
            <label>Filter Strength:</label>
            <input type="range" v-model.number="NLMeansStrength" @change="updateCurrentFilter" id="NLMeansStrength" min="0" max="100" step="1">
            <span class="threshold-value">{{ NLMeansStrength }}</span>
          </div>
          <div class="input-row">
            <label>Patch Radius:</label>
            <input type="range" @dragstart.prevent v-model.number="NLMeansRadiusPatch" @change="updateCurrentFilter" id="NLMeansRadiusPatch" min="0" max="20" step="1">
            <span class="threshold-value">{{ NLMeansRadiusPatch }}</span>
          </div>
          <div class="input-row">
            <label>Window Radius:</label>
            <input type="range" @dragstart.prevent v-model.number="NLMeansRadiusWindow" @change="updateCurrentFilter" id="NLMeansRadiusWindow" min="0" max="20" step="1">
            <span class="threshold-value">{{ NLMeansRadiusWindow }}</span>
          </div>
        </div>

        <div v-show="getFilterType() === 'diffusion'" class="control-group">
          <h3>Diffusion Filtering</h3>
          <p class="filter-note">This filter uses Partial Differential Equations as a means of denoising while trying to preserve edges.</p>

          <p class="filter-note">Note: Higher diffusion time drastically increases render time.</p>
          <div class="input-row">
            <label>Diffusion time:</label>
            <input type="range" v-model.number="diffusionTime" @change="updateCurrentFilter" id="diffusionTime" min="0" max="500" step="1">
            <span class="threshold-value">{{ diffusionTime }}</span>
          </div>
          <div class="input-row">
            <label>Diffusion Contrast:</label>
            <input type="range" @dragstart.prevent v-model.number="diffusionContrast" @change="updateCurrentFilter" id="diffusionContrast" min="0" max="20" step="0.1">
            <span class="threshold-value">{{ diffusionContrast }}</span>
          </div> 
          <div class="input-row">
            <select class="custom-select" v-model="diffusionOption" id="diffusionOption" @change="updateCurrentFilter">
              <option :value="1">Charbonnier Diffusivity</option>
              <option :value="2">Perona–Malik diffusivity</option>
            </select>
          </div>
        </div>

        <div v-show="getFilterType() === 'affineGrayscale'" class="control-group">
          <h3>Affine Grayscale Transformation</h3>
          <p class="filter-note">We move pixel values as a linear function f(x)=ax + b, with the slope being defined below. Values outside the [0,255] range are clipped. To move existing values to the [0,255] range, just click the button below</p>
          <div class="input-row">
            <label>Slope:</label>
            <input type="number" class="custom-input" v-model.number="affineGrayscaleSlope" @change="updateCurrentFilter" id="affineGrayscaleSlope">
          </div>
          <div class="input-row">
            <label>Distance:</label>
            <input type="number" class="custom-input" @dragstart.prevent v-model.number="affineGrayscaleDistance" @change="updateCurrentFilter" id="affineGrayscaleDistance">
          </div>
          <button class="btn btn-secondary" @click="optimalAffineGrayscaleTransform(); updateCurrentFilter()">
            Move image to range [0,255]
          </button>
        </div>
        <div v-show="getFilterType() === 'histogramEqualization'" class="control-group">
          <h3>Histogram Equalization</h3>
          <p class="filter-note">This algorithm tries to spread pixel values so that the possibility of each pixel value is equal.</p>
        </div>
      </aside>
      </div>
    <div class="overlay-content"></div>
  </div>
</template>

<style scoped>
/* Fullscreen Overlay Container */
.overlay-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99999;
  background-color: rgba(20, 24, 33, 0.92);
  backdrop-filter: blur(8px);
  color: #f1f5f9;
  display: flex;
  flex-direction: column;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  gap: 1rem;
}

/* Header & Controls Toolbar */
.toolbar {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
}

.toolbar-actions {
  display: flex;
  gap: 0.75rem;
}

/* Main Split Layout Body */
.content-body {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0; /* Prevents overflow from flex children */
  gap: 1.5rem;
  overflow: hidden;
}

/* Dynamic Image Frame (Flex-based, never clips) */
.image-viewport {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  min-height: 0;
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.2);
}

/* Inner wrapper snaps tightly to rendered image bounds */
.image-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  max-height: 100%;
}

#filterImage {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  display: block;
}

/* SVG wrapper covers only rendered image rect */
.svg-overlay-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.svg-overlay-wrapper svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Sidebar Panel */
.sidebar-controls {
  width: 320px;
  min-width: 320px;
  height: 100%;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 1.25rem;
  backdrop-filter: blur(4px);
  box-sizing: border-box;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-group h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f8fafc;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.input-row input[type="range"] {
  flex: 1;
}

.filter-note {
  width: 100%;
  margin: 0;
  font-size: 0.8rem;
  color: #cbd5e1;
  text-align: left;
}

/* Form Controls & Inputs */
.custom-select,
.custom-input {
  background-color: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  outline: none;
  font-size: 0.85rem;
}

input[type="range"] {
  accent-color: #3b82f6;
  cursor: pointer;
}

.threshold-value {
  font-weight: 700;
  min-width: 2rem;
  text-align: right;
  color: #60a5fa;
}

/* Button UI Components */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  outline: none;
}

.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
}

.btn-primary:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.45);
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  margin-top: 10px;
}

.btn-danger:hover {
  background-color: #dc2626;
}
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  font-weight: 500;
  z-index: 10;
  backdrop-filter: blur(4px);
}

.spinner {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>