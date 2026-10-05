<script setup>
import { ref } from 'vue';
import { applyFrequencyFilterFFT, getFFT, transformRequested } from '@/composables/transform/useTransforms';
import { getDWT, getIFFT, getIDCT, transformImageSrc, updateImageTransform, getTransformType, renderTransformToCanvas } from '../composables/transform/useTransforms.ts'
import { ImageBuffer } from '@/composables/ImageBuffer.ts';
import { useImageBufferState } from '../composables/useImageBufferState.ts';
import { Transform } from '@/composables/transform/transform.ts';

const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();

const dwtLevel = ref(1);
const lowestFrequency = ref(0);
const highestFrequency = ref(200);
const frequencyFilterOption = ref(1);
</script>

<template>
  <div class="overlay-screen">
    <header class="toolbar">
      <div class="toolbar-actions">
        <button class="btn btn-secondary" @click="updateImageTransform">
          Close
        </button>
        <button class="btn btn-primary" @click="renderTransformToCanvas">
          Paint transform to Canvas
        </button>
      </div>

      <select name="transformType" id="transformType" style="display: none;">
        <option value="none" selected="selected">none</option>
        <option value="fft">fft</option>
        <option value="dct">dct</option>
        <option value="dwt">dwt</option>
      </select>
    </header>

    <div class="content-body">
      <main class="image-viewport">
        <div v-if="Transform.isLoading.value" class="loading-overlay">
              <div class="spinner"></div>
              <span>Processing image...</span>
              <button class="btn btn-danger btn-sm" @click="Transform.abortRequest()">
                Abort current request
              </button>
          </div>
        <div class="image-wrapper" v-show="transformRequested">
          <img v-show="transformRequested" :src="transformImageSrc" id="transformImage" alt="Transform preview">
          <div v-show="getTransformType() === 'fft'" class="svg-overlay-wrapper">
            <svg v-if="imageBuffer" class="image-viewport" :viewBox="`0 0 ${imageBuffer.width.value} ${imageBuffer.height.value}`" xmlns="http://www.w3.org/2000/svg">
              <circle class="image-viewport" :cx="imageBuffer.width.value / 2" :cy="imageBuffer.height.value / 2" :r="lowestFrequency" fill="none" stroke="red" stroke-width="2" />
            </svg>
            <svg v-if="imageBuffer" class="image-viewport" :viewBox="`0 0 ${imageBuffer.width.value} ${imageBuffer.height.value}`" xmlns="http://www.w3.org/2000/svg">
              <circle class="image-viewport" :cx="imageBuffer.width.value / 2" :cy="imageBuffer.height.value / 2" :r="highestFrequency" fill="none" stroke="blue" stroke-width="2" />
            </svg>
          </div>
        </div>
      </main>
    <aside v-if="getTransformType() !== 'none'" class="sidebar-controls">
        <div v-show="getTransformType() == 'fft'" class="control-group">
          <h3>Fast Fourier Transform</h3>
          <p class="filter-note">Note: Leave the Highest Frequency to -1 if you want the threshold uncapped. After a frequency filter, an affine grayscale transform to the range [0,255] is applied. This can make some backgrounds look different.</p>
          <button class="btn btn-secondary" @click="getIFFT">IFFT</button>
          
          
          <div class="input-row">
            <label>Lowest Frequency:</label>
            <input class="custom-input" type="range" v-model.number="lowestFrequency" id="lowestFrequency" :min="0" :max="highestFrequency">
            <span style="color: red;">{{ lowestFrequency }}</span>
          </div>

          <div class="input-row">
            <label>Highest Frequency:</label>
            <input v-if="imageBuffer" class="custom-input" type="range" v-model.number="highestFrequency" id="highestFrequency" :min="lowestFrequency" :max="Math.max(imageBuffer.width.value / 2, imageBuffer.height.value/2)*1.5">
            <span style="color: lightblue;">{{ highestFrequency }}</span>
          </div>
          <div class="input-row">
            <label>Filter Method:</label>
            <select class="custom-select" v-model="frequencyFilterOption" id="frequencyFilterOption">
              <option :value="1">Hard Cutoff</option>
              <option :value="2">Butterworth</option>
              <option :value="2">Gaussian</option>
            </select>
          </div>
          <button class="btn btn-secondary" @click="applyFrequencyFilterFFT">Apply</button>
          <button class="btn btn-secondary" @click="getFFT">Reset </button>
        </div>

        <div v-show="getTransformType() == 'dct'" class="control-group">
          <h3>Discrete Cosine Transform</h3>
          <button class="btn btn-secondary" @click="getIDCT">IDCT</button>
        </div>

        <div v-show="getTransformType() == 'dwt'" class="control-group">
          <h3>Discrete Wavelet Transform</h3>
          <p class="filter-note">Note: For some reason, using small shapes (like rects) gives trouble with the DWT. Larger detail-heavy images work better.</p>
          
          <div class="input-row">
            <label>Level:</label>
            <input type="range" v-model.number="dwtLevel" @change="getDWT" id="dwtLevel" min="0" max="10">
            <span class="threshold-value">{{ dwtLevel }}</span>
          </div>
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

#transformImage {
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