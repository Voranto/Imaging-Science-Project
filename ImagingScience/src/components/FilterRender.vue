

<script setup>
import { ref } from 'vue';
import { filterRequested, filterImageSrc, getFilterType, getSimpleEdges, getCannys, getHighpassFilter } from '../composables/filters.ts'

const thresholdSimpleEdge = ref(50)
const thresholdCannyWeak = ref(50)
const thresholdCannyStrong = ref(100)

const highpassFilterSigma = ref(1)
</script>
<template>
    <div class="overlay-screen">
        <button @click="filterRequested=false" >Close </button>
        <select name="filterType" id="filterType" style="display: none;">
          <option value="none" selected="selected">none</option>
          <option value="simple_edge">simple_edge</option>
          <option value="cannys_edge">cannys_edge</option>
          <option value="highpass">highpass</option>
        </select>
        <div v-show="getFilterType() == 'simple_edge'">
            Threshold: <input type="range" v-model.number="thresholdSimpleEdge" @change="getSimpleEdges" id="simpleEdgeThreshold" min="0" max="250">
            <span class="threshold-value">{{ thresholdSimpleEdge }}</span>
            <label>Apply Gaussian Smoothing</label><input type="checkbox" id="applyGaussianSimpleEdges" @change="getSimpleEdges" checked>
        </div>
        
        <div v-show="getFilterType() == 'cannys_edge'">
            Weak Threshold: <input type="range" v-model.number="thresholdCannyWeak" @change="getCannys" id="thresholdCannyWeak" min="0" max="250">
            <span class="threshold-value">{{ thresholdCannyWeak }}</span>
            
            Strong Threshold: <input type="range" v-model.number="thresholdCannyStrong" @change="getCannys" id="thresholdCannyStrong" min="0" max="250">
            <span class="threshold-value">{{ thresholdCannyStrong }}</span>
            <label>Apply Gaussian Smoothing</label><input type="checkbox" id="applyGaussianCanny" @change="getCannys" checked>
        </div>
        <div v-show="getFilterType() == 'highpass'">
            Sigma: <input type="range" v-model.number="highpassFilterSigma" @change="getHighpassFilter" id="highpassFilterSigma" min="0" max="20">
            <span class="threshold-value">{{ highpassFilterSigma }}</span>
        </div>

        <img :src="filterImageSrc" id="filterImage">
    <div class="overlay-content">
    
  </div>
</div>
</template> 
<style scoped>
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
