<script setup lang="ts">
import { ref } from 'vue';
import ImageUploader from './components/ImageUploader.vue';
import Canvas from './components/Canvas.vue';
import TransformRender from './components/TransformRender.vue';
import {transformRequested} from './composables/useTransforms.ts'
</script>

<template>
  <main>
    <ImageUploader></ImageUploader>
    <hr>
    <div id="canvas">
      <Canvas></Canvas>
    </div>
    <TransformRender v-show="transformRequested"></TransformRender>
  </main>
</template>