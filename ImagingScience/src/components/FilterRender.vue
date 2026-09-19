

<script setup>
import { ref } from 'vue';
import { filterRequested, filterImageSrc, getFilterType, getSimpleEdges } from '../composables/filters.ts'

const threshold = ref(125)
</script>
<template>
    <div class="overlay-screen">
        <button @click="filterRequested=false" >Close </button>
        <select name="filterType" id="filterType" style="display: none;">
          <option value="none" selected="selected">none</option>
          <option value="simple_edge">simple_edge</option>
        </select>
        <div v-show="getFilterType() == 'simple_edge'">
            Threshold: <input type="range" v-model.number="threshold" @change="getSimpleEdges" id="simpleEdgeThreshold" min="0" max="250">
            <span class="threshold-value">{{ threshold }}</span>
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
