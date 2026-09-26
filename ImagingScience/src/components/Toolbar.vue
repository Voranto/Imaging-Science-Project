<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import ImageUploader from './ImageUploader.vue';
import { useImageBufferState } from '../composables/useImageBufferState.ts';

const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();

// Menu visibility state
const activeMenu = ref<'add' | 'transform' | 'filter' | 'config' | null>(null);

// Form configurations
const brushSize = ref(10);
const color = ref(0);
const gaussianSigma = ref(1);
const selectedShape = ref<'box' | 'circle' | 'gaussian'>('box');
const uniformNoiseRange = ref(0);
const gaussianNoiseMean = ref(0);
const gaussianNoiseSigma= ref(1);
const uniformMultNoiseRange= ref(0);
const gaussianMultNoiseMean = ref(0);
const gaussianMultNoiseSigma = ref(1);
const impulseNoiseHigh = ref(255);
const impulseNoiseLow = ref(0);
const impulseNoiseProbability = ref(0);

// Toggle dropdown visibility
const toggleMenu = (menuName: 'add' | 'transform' | 'filter' | 'config') => {
  activeMenu.value = activeMenu.value === menuName ? null : menuName;
};

// Emits to parent canvas
const emit = defineEmits([
  'toggleBrush', 
  'updateBrush', 
  'addObject', 
  'updateColor', 
  'applyTransform', 
  'applyFilter', 
  'clearCanvas',
  'fitCanvasToObjects',
  'fitCanvasToScreen',
  'addNoise'
]);

const handleAddShape = () => {
  emit('addObject', { shape: selectedShape.value, gaussianSigma: gaussianSigma.value});
  activeMenu.value = null; // Close menu after action
};

const handleTransform = (type: string) => {
  emit('applyTransform', type);
  activeMenu.value = null;
};

const handleFilter = (type: string) => {
  emit('applyFilter', type);
  activeMenu.value = null;
};

const handleAddNoise = (type : string) => {
    emit("addNoise", type);
    activeMenu.value = null;
}

const closeActiveMenu = () => {
    activeMenu.value = null;
}

const toolbarRef = ref<HTMLElement | null>(null);

const handleOutsideClick = (event: MouseEvent) => {
  if (toolbarRef.value && !toolbarRef.value.contains(event.target as Node)) {
    activeMenu.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});
</script>

<template>
  <div class="toolbar" ref="toolbarRef">
    <!-- 1. ADD STUFF MENU -->
    <div class="menu-group">
      <button @click="toggleMenu('add')">Add Stuff ▾</button>
      <div v-show="activeMenu === 'add'" class="dropdown-panel">
        <h4>Image</h4>
        <ImageUploader  @closeActiveMenu="closeActiveMenu"></ImageUploader>
        <h4>Shapes</h4>
        <div class="form-control">
          <label>Shape Type:</label>
          <select v-model="selectedShape">
            <option value="box">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="gaussian">Gaussian</option>
          </select>
          <label v-show="selectedShape == 'gaussian'">Sigma: {{ gaussianSigma }}</label>
          <input v-show="selectedShape == 'gaussian'"type="value" min="1" max="500" v-model="gaussianSigma">
        </div>
        <button class="primary" @click="handleAddShape">Add Selected Shape</button>
        <h4>Additive Noise</h4>
        <div class="inline-group">
            <label for="uniformNoiseRange">Range:</label>
            <input 
                type="number" 
                id="uniformNoiseRange"
                min="0" 
                max="255" 
                v-model.number="uniformNoiseRange"
            />
            <button class="primary" @click="handleAddNoise('uniform')">Uniform Noise</button>
        </div>
        <div class="inline-group">
            <label for="gaussianNoiseSigma">Sigma:</label>
            <input 
                type="number" 
                id="gaussianNoiseSigma"
                min="0" 
                max="255" 
                v-model.number="gaussianNoiseSigma"
            />
            <label for="gaussianNoiseMean">Mean:</label>
            <input 
                type="number" 
                id="gaussianNoiseMean"
                v-model.number="gaussianNoiseMean"
            />
            <button class="primary" @click="handleAddNoise('gaussian')">Gaussian Noise</button>
        </div>
        <h4>Multiplicative Noise</h4>
        <div class="inline-group">
            <label for="uniformMultNoiseRange">Range:</label>
            <input 
                type="number" 
                id="uniformMultNoiseRange"
                min="0" 
                max="255" 
                v-model.number="uniformMultNoiseRange"
            />
            <button class="primary" @click="handleAddNoise('multiplicative-uniform')">Uniform Noise</button>
        </div>
        <div class="inline-group">
            <label for="gaussianMultNoiseSigma">Sigma:</label>
            <input 
                type="number" 
                id="gaussianMultNoiseSigma"
                min="0" 
                max="255" 
                v-model.number="gaussianMultNoiseSigma"
            />
            <label for="gaussianMultNoiseMean">Mean:</label>
            <input 
                type="number" 
                id="gaussianMultNoiseMean"
                v-model.number="gaussianMultNoiseMean"
            />
            <button class="primary" @click="handleAddNoise('multiplicative-gaussian')">Gaussian Noise</button>
        </div>
        <h4>Other Noises</h4>
        <div class="inline-group">
            <label for="impulseNoiseLow">Low value:</label>
            <input 
                type="number" 
                id="impulseNoiseLow"
                min="0" 
                max="255" 
                v-model.number="impulseNoiseLow"
            />
            <label for="impulseNoiseHigh">High value:</label>
            <input 
                type="number" 
                id="impulseNoiseHigh"
                min="0" 
                max="255" 
                v-model.number="impulseNoiseHigh"
            />
            <label for="impulseNoiseProbability">Probability (%):</label>
            <input 
                type="number" 
                id="impulseNoiseProbability"
                min="0" 
                max="100"
                v-model.number="impulseNoiseProbability"
            />
            <button class="primary" @click="handleAddNoise('impulse')">Impulse Noise</button>
        </div>
        <h4>Brush</h4>
        <button @click="$emit('toggleBrush')">Toggle Drawing Brush</button>
        <label>Brush Active: {{ imageBuffer?.isDrawing.value }}</label>
      </div>
    </div>

    <!-- 2. APPLY TRANSFORM MENU -->
    <div class="menu-group">
      <button @click="toggleMenu('transform')">Transforms ▾</button>
      <div v-show="activeMenu === 'transform'" class="dropdown-panel">
        <h4>Select Transform</h4>
        <button @click="handleTransform('fft')">FFT (Fast Fourier)</button>
        <button @click="handleTransform('dct')">DCT (Discrete Cosine)</button>
        <button @click="handleTransform('dwt')">DWT (Discrete Wavelet)</button>
      </div>
    </div>

    <!-- 3. APPLY FILTER MENU -->
    <div class="menu-group">
      <button @click="toggleMenu('filter')">Filters ▾</button>
      <div v-show="activeMenu === 'filter'" class="dropdown-panel">
        <h4>Edge Detectors</h4>
        <button @click="handleFilter('simple-edge')">Simple Edge</button>
        <button @click="handleFilter('canny')">Canny Edge</button>
        <h4>Corner Detectors</h4>
        <button @click="handleFilter('tomasi')">Tomasi/Kanade</button>
        <h4>Frequency Filters</h4>
        <button @click="handleFilter('highpass')">Highpass Filter</button>
        <button @click="handleFilter('lowpass')">Lowpass Filter</button>
        <h4>Corrections</h4>
        <button @click="handleFilter('gamma')">Gamma Correction</button>
      </div>
    </div>

    <!-- 4. CONFIG MENU -->
    <div class="menu-group">
      <button @click="toggleMenu('config')">Config ▾</button>
      <div v-show="activeMenu === 'config'" class="dropdown-panel">
        <h4>Canvas Settings</h4>
        <div class="form-control">
          <label>Brush Size: {{ brushSize }}px</label>
          <input type="range" min="1" max="100" v-model="brushSize" @input="$emit('updateBrush', brushSize)"  id="brushSize">
          <label>Color: {{ color }}</label>
          <input type="range" min="0" max="255" v-model="color" @input="$emit('updateColor')" id="objectColorSelector">
        </div>
        <hr>
        <button @click="$emit('fitCanvasToObjects'); activeMenu = null">Fit Canvas to Objects</button>
        <button @click="$emit('fitCanvasToScreen'); activeMenu = null">Fit Canvas to Screen</button>
        <button class="danger" @click="$emit('clearCanvas'); activeMenu = null">Clear Entire Canvas</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inline-group {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.inline-group label {
  font-size: 0.85rem;
  white-space: nowrap; /* Prevents "Range:" text from wrapping */
}

.inline-group input[type="number"] {
  width: 60px; /* Small fixed width for numeric input */
  padding: 4px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.inline-group button {
  flex: 1; /* Allows button to fill remaining space cleanly */
  white-space: nowrap;
}

.toolbar {
  display: flex;
  gap: 12px;
  background: #f4f4f5;
  padding: 8px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.menu-group {
  position: relative;
}

.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  background: white;
  border: 1px solid #e4e4e7;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
  min-width: 200px;
}

.form-control {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

button.primary {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
}

button.danger {
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
}
</style>