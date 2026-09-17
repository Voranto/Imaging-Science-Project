<script setup lang="ts">
import { ref } from 'vue';
import ImageUploader from './components/ImageUploader.vue';
import Canvas from './components/Canvas.vue';

</script>

<template>
  <main>
    <ImageUploader></ImageUploader>
    <hr>
    <div id="canvas">
      <Canvas></Canvas>
    </div>
  </main>
</template>