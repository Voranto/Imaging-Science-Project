

<script setup>
import { ref } from 'vue';
import {transformRequested, transformImageSrc} from '../composables/useTransforms.ts'

</script>
<template>
    <div class="overlay-screen">
        <button @click="transformRequested=false">Close </button>
        <img v-if="transformImageSrc" :src="transformImageSrc">
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
