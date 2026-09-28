

<script setup>
import { ref } from 'vue';
import { filterRequested, filterImageSrc, getFilterType, getSimpleEdges, getCannys, getHighpassFilter, getLowpassFilter, getGammaCorrection, updateCurrentFilter } from '../composables/filters/useFilter.ts'
import { Filter } from '@/composables/filters/Filter.ts';
const thresholdSimpleEdge = ref(50)
const thresholdCannyWeak = ref(50)
const thresholdCannyStrong = ref(100)

const highpassFilterSigma = ref(1)
const lowpassFilterSigma = ref(1)
const gammaCorrectionValue = ref(1.0)

const cornerSigma = ref(2);
const cornerRho = ref(4);

const cornerThreshold = ref(20);

const morphologicalFilters = ["dilation","erosion","opening","closing","whiteTopHat","blackTopHat","selfdualTopHat","medianFilter",]
const morphologicalRadius = ref(1);
const medianRadius = ref(1);

const waveletShrinkageMode = ref("hard");
const waveletShrinkageThreshold = ref(1);

const bilateralSigmaSpatial = ref(1);
const bilateralSigmaTonal = ref(1);

const NLMeansRadiusPatch = ref(3);
const NLMeansRadiusWindow = ref(10);
const NLMeansStrength = ref(3);

</script>
<template>
    <div class="overlay-screen">
        <button @click="filterRequested=false" >Close </button>
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
        </select>
        <div v-show="getFilterType() == 'simpleEdge'">
            Threshold: <input type="range" v-model.number="thresholdSimpleEdge" @change="getSimpleEdges" id="simpleEdgeThreshold" min="0" max="250">
            <span class="threshold-value">{{ thresholdSimpleEdge }}</span>
            <label>Apply Gaussian Smoothing</label><input type="checkbox" id="applyGaussianSimpleEdges" @change="getSimpleEdges" checked>
        </div>
        
        <div v-show="getFilterType() == 'cannys'">
            Weak Threshold: <input type="range" v-model.number="thresholdCannyWeak" @change="getCannys" id="thresholdCannyWeak" min="0" max="250">
            <span class="threshold-value">{{ thresholdCannyWeak }}</span>
            
            Strong Threshold: <input type="range" v-model.number="thresholdCannyStrong" @change="getCannys" id="thresholdCannyStrong" min="0" max="250">
            <span class="threshold-value">{{ thresholdCannyStrong }}</span>
            <label>Apply Gaussian Smoothing</label><input type="checkbox" id="applyGaussianCanny" @change="getCannys" checked>
        </div>
        <div v-show="getFilterType() == 'lowpass'">
            Sigma: <input type="range" v-model.number="lowpassFilterSigma" @change="getLowpassFilter" id="lowpassFilterSigma" min="0" max="20">
            <span class="threshold-value">{{ lowpassFilterSigma }}</span>
        </div>
        <div v-show="getFilterType() == 'highpass'">
            Sigma: <input type="range" v-model.number="highpassFilterSigma" @change="getHighpassFilter" id="highpassFilterSigma" min="0" max="20">
            <span class="threshold-value">{{ highpassFilterSigma }}</span>
        </div>
        <div v-show="getFilterType() == 'gammaCorrection'">
            Sigma: <input type="range" v-model.number="gammaCorrectionValue" @change="getGammaCorrection" id="gammaCorrectionValue" min="0.1" max="4.0" step="0.1">
            <span class="threshold-value">{{ gammaCorrectionValue }}</span>
        </div>
        <div v-show="getFilterType()?.startsWith('corner')">
            Sigma: <input type="range" v-model.number="cornerSigma" @change="updateCurrentFilter" id="cornerSigma" min="0.1" max="20" step="0.1">
            <span class="threshold-value">{{ cornerSigma }}</span>
            Rho: <input type="range" v-model.number="cornerRho" @change="updateCurrentFilter" id="cornerRho" min="{{ cornerRho }}" max="20" step="0.1">
            <span class="threshold-value">{{ cornerRho }}</span>
            Threshold: <input type="range" v-model.number="cornerThreshold" @change="updateCurrentFilter" id="cornerThreshold" min="0.1" max="250" step="0.1">
            <span class="threshold-value">{{ cornerThreshold }}</span>
        </div>
        <div v-show="morphologicalFilters.includes(getFilterType())">
            Radius: <input type="range" v-model.number="morphologicalRadius" @change="updateCurrentFilter" id="morphologicalRadius" min="0" max="25" step="1">
            <span class="threshold-value">{{ morphologicalRadius }}</span>
            Mask Type:
            <select id="morphologicalMaskType" @change="updateCurrentFilter">
                <option value="circle">Circle</option>
                <option value="square">Square</option>
            </select>
        </div>
        <div v-show="getFilterType() === 'median'">
            Radius: <input type="range" v-model.number="medianRadius" @change="updateCurrentFilter" id="medianRadius" min="0" max="25" step="1">
            <span class="threshold-value">{{ medianRadius }}</span>
        </div>
        <div v-show="getFilterType() === 'waveletShrinkage'">
            Threshold: <input type="range" v-model.number="waveletShrinkageThreshold" @change="updateCurrentFilter" id="waveletShrinkageThreshold" min="0" max="100" step="1">
            <span class="threshold-value">{{ waveletShrinkageThreshold }}</span>
            <select v-model="waveletShrinkageMode" id="waveletShrinkageMode" @change="updateCurrentFilter">
                <option value="hard">hard</option>
                <option value="soft">soft</option>
                <option value="garrote">garrote</option>
            </select>
        </div>
        <div v-show="getFilterType() === 'bilateral'">
            Note: Higher spatial sigma values make the render much slower, try to keep it under 10.

            Sigma Spatial: <input type="range" v-model.number="bilateralSigmaSpatial" @change="updateCurrentFilter" id="bilateralSigmaSpatial" min="0" max="50" step="1">
            <span class="threshold-value">{{ bilateralSigmaSpatial }}</span>

            Sigma Tonal: <input type="range" @dragstart.prevent v-model.number="bilateralSigmaTonal" @change="updateCurrentFilter" id="bilateralSigmaTonal" min="0" max="500" step="1">
            <span class="threshold-value">{{ bilateralSigmaTonal }}</span>
        </div>
        <div v-show="getFilterType() === 'NLMeans'">
            Note: Higher Window Size values make the render much slower, so try to avoid changing the bottom two parameters too much

            Filter Strength: <input type="range" v-model.number="NLMeansStrength" @change="updateCurrentFilter" id="NLMeansStrength" min="0" max="100" step="1">
            <span class="threshold-value">{{ NLMeansStrength }}</span>

            Patch Radius: <input type="range" @dragstart.prevent v-model.number="NLMeansRadiusPatch" @change="updateCurrentFilter" id="NLMeansRadiusPatch" min="0" max="20" step="1">
            <span class="threshold-value">{{ NLMeansRadiusPatch }}</span>

            Window Radius: <input type="range" @dragstart.prevent v-model.number="NLMeansRadiusWindow" @change="updateCurrentFilter" id="NLMeansRadiusWindow" min="0" max="20" step="1">
            <span class="threshold-value">{{ NLMeansRadiusWindow }}</span>
        </div>
        <div v-if="Filter.isLoading.value" class="loading-overlay">
            <div class="spinner"></div>
            <span>Processing image...</span>
            <button @click="Filter.abortRequest()">Abort current request</button>
        </div>
        <img :src="filterImageSrc" id="filterImage">
    <div class="overlay-content">
    
  </div>
</div>
</template> 
<style scoped>
/* Container must be position: relative for absolute overlay positioning */
.image-preview-container {
  position: relative;
  display: inline-block;
  min-width: 200px;
  min-height: 200px;
}

/* Semi-transparent overlay covering the image */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Dims the background image */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  font-weight: 500;
  z-index: 10;
  backdrop-filter: blur(2px); /* Optional background blur */
}

/* CSS Animated Spinner */
.spinner {
  width: 36px;
  height: 36px;
  margin-bottom: 8px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.overlay-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  
  z-index: 99999; 
  
  background-color: rgba(121, 118, 118, 0.9); 
  color: white;
  
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay-content {
  text-align: center;
}
</style>
