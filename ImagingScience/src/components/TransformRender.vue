

<script setup>
import { ref } from 'vue';
import {transformRequested , updateImageTransform} from '../composables/useTransforms.ts'

</script>
<template>
    <div class="overlay-screen">
        <button @click="updateImageTransform" >Close </button>
        <select name="transformType" id="transformType" style="display: none;">
          <option value="none" selected="selected">none</option>
          <option value="fft">fft</option>
          <option value="dct">dct</option>
          <option value="dwt">dwt</option>
        </select>
        <canvas v-show="transformRequested" ref="transformImageCanvas" style="border:1px solid #000000" id="transformImageCanvas"></canvas>
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
