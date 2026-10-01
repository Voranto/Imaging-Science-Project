<script setup>
import { ref } from 'vue';
import { transformRequested } from '@/composables/transform/useTransforms';
import { getDWT, getIFFT, getIDCT, transformImageSrc, updateImageTransform, getTransformType, renderTransformToCanvas } from '../composables/transform/useTransforms.ts'

const dwtLevel = ref(1);
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

      <!-- Dynamic Transform Parameters Panel -->
      <div class="filter-controls">
        <div v-show="getTransformType() == 'fft'" class="control-group">
          <button class="btn btn-secondary" @click="getIFFT">IFFT</button>
        </div>

        <div v-show="getTransformType() == 'dct'" class="control-group">
          <button class="btn btn-secondary" @click="getIDCT">IDCT</button>
        </div>

        <div v-show="getTransformType() == 'dwt'" class="control-group">
          <label>Level:</label>
          <input type="range" v-model.number="dwtLevel" @change="getDWT" id="dwtLevel" min="0" max="10">
          <span class="threshold-value">{{ dwtLevel }}</span>
        </div>
      </div>
    </header>

    <main class="image-viewport">
      <img v-show="transformRequested" :src="transformImageSrc" id="transformImage" alt="Transform preview">
    </main>

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
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header & Controls Toolbar */
.toolbar {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  z-index: 20;
}

.toolbar-actions {
  display: flex;
  gap: 0.75rem;
}

/* Dynamic Filter/Transform Control Panel */
.filter-controls {
  width: 100%;
  display: flex;
  justify-content: center;
}

.control-group {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  backdrop-filter: blur(4px);
  font-size: 0.9rem;
}

/* Dynamic Image Frame taking ~80% of space */
.image-viewport {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80vw;
  height: 80vh;
  max-width: 80vw;
  max-height: 80vh;
  margin: auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.2);
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

/* Dynamic Inputs & Range Controls */
.threshold-value {
  font-weight: 700;
  min-width: 2rem;
  text-align: right;
  color: #60a5fa;
}

input[type="range"] {
  accent-color: #3b82f6;
  cursor: pointer;
}
</style>