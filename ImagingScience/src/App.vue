<script setup lang="ts">
import { ref } from 'vue';
import ImageUploader from './components/ImageUploader.vue';
import Canvas from './components/Canvas.vue';
import FilterRender from './components/FilterRender.vue'
import TransformRender from './components/TransformRender.vue';
import {transformRequested} from './composables/useTransforms.ts'
import {filterRequested} from './composables/filters.ts'

</script>

<template>
  <main>
    <ImageUploader></ImageUploader>
    <hr>
    <div id="canvas">
      <Canvas></Canvas>
    </div>
    <TransformRender v-show="transformRequested"></TransformRender>
    <FilterRender v-show="filterRequested"></FilterRender>
  </main>
</template>