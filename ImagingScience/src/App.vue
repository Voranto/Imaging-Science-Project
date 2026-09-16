<script setup lang="ts">
import { ref } from 'vue';
import ImageUploader from './components/ImageUploader.vue';
import ImageViewer from './components/ImageViewer.vue';

const image_uploaded = ref(false);
</script>

<template>
  <main>
    <ImageUploader @uploaded="image_uploaded = true"></ImageUploader>
    <ImageViewer v-if="image_uploaded"></ImageViewer>
  </main>
</template>