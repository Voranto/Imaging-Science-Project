<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import ImageUploader from './ImageUploader.vue';
import { useImageBufferState } from '../composables/useImageBufferState.ts';
import CollapsibleToolbarItem from './CollapsibleToolbarItem.vue';
const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();
import { histogramCanvas } from '@/composables/histogram.ts';
import { ImageBuffer } from '@/composables/ImageBuffer.ts';
import { colorSelector } from '@/composables/objectColor.ts';
import { backgroundColorSelector } from '@/composables/backgroundColor.ts';
// Menu visibility state
const activeMenu = ref<string | null>(null);


// Form configurations
const brushSize = ref(10);
const sinusoidalCyclesX = ref(5);
const sinusoidalCyclesY = ref(5);
const checkerboardRows = ref(5);
const checkerboardColumns = ref(5);
const gridRows = ref(5);
const gridColumns = ref(5);
const gaussianSigma = ref(30);
const selectedShape = ref<string>('box');
const uniformNoiseRange = ref(50);
const gaussianNoiseMean = ref(0);
const gaussianNoiseSigma= ref(30);
const uniformMultNoiseRange= ref(1.5);
const gaussianMultNoiseMean = ref(0);
const gaussianMultNoiseSigma = ref(0.1);
const impulseNoiseHigh = ref(255);
const impulseNoiseLow = ref(0);
const impulseNoiseProbability = ref(33);

const toggleMenu = (menuName: string) => {
  activeMenu.value = activeMenu.value === menuName ? null : menuName;
};

//Only one dropdown section open at once
const activeSection = ref<string | null>(null);

const toggleSection = (sectionName: string) => {
  activeSection.value = activeSection.value === sectionName ? null : sectionName;
};

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
  'addNoise',
  'resizeCanvasOptimal',
  'updateBackground'
]);

const handleAddShape = () => {
  emit('addObject', { shape: selectedShape.value, gaussianSigma: gaussianSigma.value, sinusoidalCyclesX : sinusoidalCyclesX.value , sinusoidalCyclesY : sinusoidalCyclesY.value, checkerboardRows: checkerboardRows.value, checkerboardColumns: checkerboardColumns.value, gridRows:gridRows.value, gridColumns: gridColumns.value},);
  activeMenu.value = null;
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
    activeSection.value = null;
}

const toolbarRef = ref<HTMLElement | null>(null);

const handleOutsideClick = (event: MouseEvent) => {
  if (toolbarRef.value && !toolbarRef.value.contains(event.target as Node)) {
    closeActiveMenu();
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
      <button @click="toggleMenu('add')">Add ▾</button>
      <div v-show="activeMenu === 'add'" class="dropdown-panel">
        <CollapsibleToolbarItem title="Image" :isOpen="activeSection === 'Image'" @toggle="toggleSection('Image')">
          <div class="section-content">
            <ImageUploader @closeActiveMenu="closeActiveMenu" />
          </div>
        </CollapsibleToolbarItem>

        <CollapsibleToolbarItem title="Shapes" :isOpen="activeSection === 'Shapes'" @toggle="toggleSection('Shapes')">
          <div class="section-content vertical-stack">
            <div class="form-control">
              <label for="shapeSelect">Shape Type</label>
              <select id="shapeSelect" v-model="selectedShape" class="input-field">
                <option value="box">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="gaussian">Gaussian</option>
                <option value="sinusoidal">Sinusoidal</option>
                <option value="checkerboard">Checkerboard (box function)</option>
                <option value="grid">Grid</option>
              </select>
            </div>

            <div v-show="selectedShape === 'gaussian'" class="form-control">
              <label>Sigma: <strong>{{ gaussianSigma }}</strong></label>
              <input type="number" min="1" max="500" v-model.number="gaussianSigma" class="input-field" />
            </div>
            <div v-show="selectedShape === 'sinusoidal'" class="form-control">
              <label>Cycles X: <strong>{{ sinusoidalCyclesX }}</strong></label>
              <input type="range" min="0" max="100" v-model.number="sinusoidalCyclesX" class="input-field" />
              <label>Cycles Y: <strong>{{ sinusoidalCyclesY }}</strong></label>
              <input type="range" min="0" max="100" v-model.number="sinusoidalCyclesY" class="input-field" />
            </div>
            <div v-show="selectedShape === 'checkerboard'" class="form-control">
              <label>Rows: <strong>{{ checkerboardRows }}</strong></label>
              <input type="range" min="0" max="100" v-model.number="checkerboardRows" class="input-field" />
              <label>Columns: <strong>{{ checkerboardColumns }}</strong></label>
              <input type="range" min="0" max="100" v-model.number="checkerboardColumns" class="input-field" />
            </div>
            <div v-show="selectedShape === 'grid'" class="form-control">
              <label>Rows: <strong>{{ gridRows }}</strong></label>
              <input type="range" min="0" max="100" v-model.number="gridRows" class="input-field" />
              <label>Columns: <strong>{{ gridColumns }}</strong></label>
              <input type="range" min="0" max="100" v-model.number="gridColumns" class="input-field" />
            </div>
            <button class="primary full-width" @click="handleAddShape">Add Selected Shape</button>
          </div>
        </CollapsibleToolbarItem>

        <CollapsibleToolbarItem title="Additive Noise" :isOpen="activeSection === 'Additive Noise'" @toggle="toggleSection('Additive Noise')">
          <div class="section-content vertical-stack">
            <div class="control-row">
              <div class="field-group">
                <label for="uniformNoiseRange">Range</label>
                <input type="number" id="uniformNoiseRange" min="0" max="255" v-model.number="uniformNoiseRange" class="input-field" />
              </div>
              <button class="primary" @click="handleAddNoise('uniform')">Uniform Noise</button>
            </div>

            <div class="control-row">
              <div class="field-group">
                <label for="gaussianNoiseSigma">Sigma</label>
                <input type="number" id="gaussianNoiseSigma" min="0" max="255" v-model.number="gaussianNoiseSigma" class="input-field" />
              </div>
              <div class="field-group">
                <label for="gaussianNoiseMean">Mean</label>
                <input type="number" id="gaussianNoiseMean" v-model.number="gaussianNoiseMean" class="input-field" />
              </div>
              <button class="primary" @click="handleAddNoise('gaussian')">Gaussian Noise</button>
            </div>
          </div>
        </CollapsibleToolbarItem>

        <CollapsibleToolbarItem title="Multiplicative Noise" :isOpen="activeSection === 'Multiplicative Noise'" @toggle="toggleSection('Multiplicative Noise')">
          <div class="section-content vertical-stack">
            <div class="control-row">
              <div class="field-group">
                <label for="uniformMultNoiseRange">Range</label>
                <input type="number" id="uniformMultNoiseRange" min="0" max="255" v-model.number="uniformMultNoiseRange" class="input-field" />
              </div>
              <button class="primary" @click="handleAddNoise('multiplicative-uniform')">Uniform Noise</button>
            </div>

            <div class="control-row">
              <div class="field-group">
                <label for="gaussianMultNoiseSigma">Sigma</label>
                <input type="number" id="gaussianMultNoiseSigma" min="0" max="255" v-model.number="gaussianMultNoiseSigma" class="input-field" />
              </div>
              <div class="field-group">
                <label for="gaussianMultNoiseMean">Mean</label>
                <input type="number" id="gaussianMultNoiseMean" v-model.number="gaussianMultNoiseMean" class="input-field" />
              </div>
              <button class="primary" @click="handleAddNoise('multiplicative-gaussian')">Gaussian Noise</button>
            </div>
          </div>
        </CollapsibleToolbarItem>

        <CollapsibleToolbarItem title="Other Noises" :isOpen="activeSection === 'Other Noises'" @toggle="toggleSection('Other Noises')">
          <div class="section-content vertical-stack">
            <div class="control-row">
              <div class="field-group">
                <label for="impulseNoiseLow">Low</label>
                <input type="number" id="impulseNoiseLow" min="0" max="255" v-model.number="impulseNoiseLow" class="input-field" />
              </div>
              <div class="field-group">
                <label for="impulseNoiseHigh">High</label>
                <input type="number" id="impulseNoiseHigh" min="0" max="255" v-model.number="impulseNoiseHigh" class="input-field" />
              </div>
              <div class="field-group">
                <label for="impulseNoiseProbability">Prob (%)</label>
                <input type="number" id="impulseNoiseProbability" min="0" max="100" v-model.number="impulseNoiseProbability" class="input-field" />
              </div>
            </div>
            <button class="primary full-width" @click="handleAddNoise('impulse')">Apply Impulse Noise</button>
          </div>
        </CollapsibleToolbarItem>

        <CollapsibleToolbarItem title="Brush" :isOpen="activeSection === 'Brush'" @toggle="toggleSection('Brush')">
          <div class="section-content vertical-stack">
            <button class="secondary full-width" @click="$emit('toggleBrush')">Toggle Drawing Brush</button>
            
            <span>Brush Size: {{ brushSize }}px</span>
            <input type="range" min="1" max="100" v-model="brushSize" @input="$emit('updateBrush', brushSize)"  id="brushSize">
            <div class="status-badge" :class="{ active: imageBuffer?.isDrawing.value }">
              Status: {{ imageBuffer?.isDrawing.value ? 'Active' : 'Inactive' }}
            </div>
          </div>
        </CollapsibleToolbarItem>
      </div>
    </div>
    <div class="menu-group">
      <button @click="toggleMenu('enhancements')">Enhancements & Adjustments ▾</button>
      <div v-show="activeMenu === 'enhancements'" class="dropdown-panel">
        
        <CollapsibleToolbarItem title="Point Operations" :isOpen="true" @toggle="toggleSection('Point Operations')">
          <div class="button-grid">
            <button @click="handleFilter('gammaCorrection')" class="btn-item">Gamma Correction</button>
            <button @click="handleFilter('affineGrayscale')" class="btn-item">Affine Grayscale Transformation</button>
            <button @click="handleFilter('histogramEqualization')" class="btn-item">Histogram Equalization</button>
          </div>
        </CollapsibleToolbarItem>
          
      </div>
    </div>
    <!-- 2. APPLY TRANSFORM MENU -->
    <div class="menu-group">
      <button @click="toggleMenu('transform')">Transforms (Frequency Domain) ▾</button>
      <div v-show="activeMenu === 'transform'" class="dropdown-panel">
        <CollapsibleToolbarItem title="Transforms" :isOpen="true" @toggle="toggleSection('Transforms')">
          <div class="button-grid">
            <button @click="handleTransform('fft')" class="btn-item">FFT (Fast Fourier)</button>
            <button @click="handleTransform('dct')" class="btn-item">DCT (Discrete Cosine)</button>
            <button @click="handleTransform('dwt')" class="btn-item">DWT (Discrete Wavelet)</button>
          </div>
        </CollapsibleToolbarItem>
      </div>
    </div>

    <!-- 3. APPLY FILTER MENU -->
    <div class="menu-group">
      <button @click="toggleMenu('filter')">Filters (Spatial Domain) ▾</button>
      <div v-show="activeMenu === 'filter'" class="dropdown-panel">
        <CollapsibleToolbarItem title="Frequency Filters" :isOpen="activeSection === 'Frequency Filters'" @toggle="toggleSection('Frequency Filters')">
          <div class="button-grid">
            <button @click="handleFilter('highpass')" class="btn-item">Highpass Filter</button>
            <button @click="handleFilter('lowpass')" class="btn-item">Lowpass Filter</button>
          </div>
        </CollapsibleToolbarItem>
        <CollapsibleToolbarItem title="Edge Detectors" :isOpen="activeSection === 'Edge Detectors'" @toggle="toggleSection('Edge Detectors')">
          <div class="button-grid">
            <button @click="handleFilter('simpleEdge')"class="btn-item">Simple Edge</button>
            <button @click="handleFilter('cannys')"class="btn-item">Canny Edge</button>
          </div>
        </CollapsibleToolbarItem>
        <CollapsibleToolbarItem title="Corner Detectors" :isOpen="activeSection === 'Corner Detectors'" @toggle="toggleSection('Corner Detectors')">
          <div class="button-grid">
            <button @click="handleFilter('cornerTomasi')"  class="btn-item">Tomasi/Kanade</button>
            <button @click="handleFilter('cornerRohr')"  class="btn-item">Rohr</button>
            <button @click="handleFilter('cornerHarris')" class="btn-item">Harris/Förstner</button>
          </div>
        </CollapsibleToolbarItem>
        <CollapsibleToolbarItem title="Morphological Filters" :isOpen="activeSection === 'Morphological Filters'" @toggle="toggleSection('Morphological Filters')">
        <div class="button-grid">
            <button @click="handleFilter('dilation')" class="btn-item">Dilation</button>
            <button @click="handleFilter('erosion')" class="btn-item">Erosion</button>
            <button @click="handleFilter('opening')" class="btn-item">Opening</button>
            <button @click="handleFilter('closing')" class="btn-item">Closing</button>
            <button @click="handleFilter('whiteTopHat')" class="btn-item">White Top Hat</button>
            <button @click="handleFilter('blackTopHat')" class="btn-item">Black Top Hat</button>
            <button @click="handleFilter('selfdualTopHat')" class="btn-item">Selfdual Top Hat</button>
          </div>
        </CollapsibleToolbarItem>
        <CollapsibleToolbarItem title="Smoothing/Denoising" :isOpen="activeSection === 'Smoothing/Denoising'" @toggle="toggleSection('Smoothing/Denoising')">
          <div class="button-grid">
            <button @click="handleFilter('median')" class="btn-item">Median Filter</button>
            <button @click="handleFilter('waveletShrinkage')" class="btn-item">Wavelet Shrinkage</button>
            <button @click="handleFilter('bilateral')" class="btn-item">Bilateral Filter</button>
            <button @click="handleFilter('NLMeans')" class="btn-item">NL Means</button>
            <button @click="handleFilter('diffusion')" class="btn-item">Diffusion Filter</button>
          </div>
        </CollapsibleToolbarItem><CollapsibleToolbarItem title="Global Filters" :isOpen="activeSection === 'Global Filters'" @toggle="toggleSection('Global Filters')">
          <div class="button-grid">
            <button @click="handleFilter('variational')" class="btn-item">Variational Method</button>
          </div>
        </CollapsibleToolbarItem>
      </div>
    </div>

    <!-- 4. CONFIG MENU -->
    <div class="menu-group">
      <button @click="toggleMenu('config')">Tool & Canvas Config ▾</button>
      <div v-show="activeMenu === 'config'" class="dropdown-panel">
        <span><h4>Canvas Settings</h4></span>
        <div class="form-control">
          <label>Object Color: {{ colorSelector }}</label>
          <input type="range" min="0" max="255" v-model="colorSelector" @input="$emit('updateColor')" id="objectColorSelector">
          <label>Background Color: {{ backgroundColorSelector }}</label>
          <input type="range" min="0" max="255" v-model="backgroundColorSelector" @input="$emit('updateBackground')" id="backgroundColorSelector">
        
        </div>
        <hr>
        <div id="control-row">
        <span>Height: </span>
        <input @change="imageBuffer.setCanvasDimensions(imageBuffer.height.value, imageBuffer.width.value)" type="number" v-if="imageBuffer" v-model="imageBuffer.height.value">
        <span> Width:</span> 
        <input type="number" v-if="imageBuffer" v-model="imageBuffer.width.value" @change="imageBuffer.setCanvasDimensions(imageBuffer.height.value, imageBuffer.width.value)">

        </div>
        <div id="control-row">
            <span>Auto resize canvas when resizing window: </span>
            <input @change="imageBuffer.resizeCanvas" v-if="imageBuffer" v-model="imageBuffer.autoResizeCanvas.value" type="checkbox">
        </div>
        <button @click="$emit('resizeCanvasOptimal'); activeMenu = null">Resize Canvas to 2^n</button>
        <button @click="$emit('fitCanvasToObjects'); activeMenu = null">Fit Canvas to Objects</button>
        <button @click="$emit('fitCanvasToScreen'); activeMenu = null">Fit Canvas to Screen</button>
        <button class="danger" @click="$emit('clearCanvas'); activeMenu = null">Clear Entire Canvas</button>
      </div>
    </div>
    <div class="menu-group">
      <button @click="toggleMenu('stats')">Stats ▾</button>
      <div v-show="activeMenu === 'stats'" class="dropdown-panel-reverse">
        <span>Mean: </span> <span id="mean">{{ imageBuffer?.mean }}</span>
        <span>Variance: </span><span id="variance"> {{imageBuffer?.variance}}</span>
        <span>Histogram:</span>
        <div class="histogram-container">
          <canvas ref="histogramCanvas"></canvas>
        </div>
     </div>
    </div>
  </div>
</template>
<style scoped>
/* Top Level Toolbar Layout */
.toolbar {
  display: flex;
  gap: 12px;
  background: #f8fafc;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 12px;
}

.menu-group {
  position: relative;
}

/* Expanded Dropdown Panel */
.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
  min-width: 320px; /* Expanded for comfortable input display */
}
.dropdown-panel-reverse {
  position: absolute;
  top: 100%;
  right: 0%;
  margin-top: 6px;
  margin-right: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
  min-width: 320px; /* Expanded for comfortable input display */
}
/* Number Inputs */
.dropdown-panel input[type="number"], .dropdown-panel-reverse input[type="number"] {
  width: 70px;
  padding: 4px 6px;
  font-size: 0.85rem;
  color: #1e293b;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.dropdown-panel input[type="number"]:focus, .dropdown-panel-reverse input[type="number"]:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

/* Checkbox */
.dropdown-panel input[type="checkbox"], .dropdown-panel-reverse input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
  cursor: pointer;
  vertical-align: middle;
}

/* Label Spans inside Dropdown */
.dropdown-panel span, .dropdown-panel-reverse span {
  font-size: 0.85rem;
  color: #334155;
  font-weight: 500;
  vertical-align: middle;
}
/* Section Content Wrapper inside Collapsibles */
.section-content {
  padding: 8px 4px 4px 4px;
}

.vertical-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Form Controls & Layout Grids */
.control-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.field-group label,
.form-control label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.form-control {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Modern Shared Inputs */
.input-field,
select.input-field {
  width: 100%;
  padding: 6px 8px;
  font-size: 0.85rem;
  color: #1e293b;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input-field:focus,
select.input-field:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

/* Button Variants */
button {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

button.primary {
  background-color: #2563eb;
  color: #ffffff;
  border: 1px solid #2563eb;
}

button.primary:hover {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

button.secondary {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
}

button.secondary:hover {
  background-color: #e2e8f0;
}

button.danger {
  background-color: #dc2626;
  color: #ffffff;
  border: 1px solid #dc2626;
}

button.danger:hover {
  background-color: #b91c1c;
}

.full-width {
  width: 100%;
}

/* Brush Status Badge */
.status-badge {
  font-size: 0.8rem;
  text-align: center;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f1f5f9;
  color: #64748b;
  font-weight: 500;
}

.status-badge.active {
  background-color: #dbeafe;
  color: #1e40af;
}
</style>