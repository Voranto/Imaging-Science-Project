

<script setup lang="ts">
import { ref, onMounted, onUnmounted, useTemplateRef,shallowRef , type ShallowRef } from 'vue';
import { Canvas, Rect, FabricImage, PencilBrush, Circle, FabricObject, ActiveSelection } from 'fabric'; 
import { ImageBuffer, getObjectGrayscale } from '../composables/ImageBuffer.ts'
import { getFFT, getDCT, getDWT } from '../composables/transform/useTransforms.ts'
import {handleFilter } from '../composables/filters/useFilter.ts'
import { useImageBufferState } from '../composables/useImageBufferState.ts';
import Toolbar from './Toolbar.vue';
import { applyUniformNoise, applyGaussianNoise, applyMultiplicativeUniformNoise, applyMultiplicativeGaussianNoise, applyImpulseNoise } from '@/composables/noise/applyNoise.ts';
import { getColorSelector, setColorSelector } from '@/composables/objectColor.ts';
import { clearCanvas } from '../composables/canvas.ts';
import { getBackgroundColor } from '@/composables/backgroundColor.ts';
import { copyObject, deleteActiveObject, fitCanvasToObjects, fitCanvasToScreen, handleAddNoise, handleAddObject, handleCanvasResize, handleTransform, pasteObject, resizeCanvasOptimal, updateBackgroundColor, updateBrushSize, updateObjectColor } from '@/composables/canvas.ts';
const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();
// Reference to the canvas object
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasObject");



onMounted(() => {
  if (!canvasRef.value) return;
  imageBuffer.value = new ImageBuffer(canvasRef.value, window.innerWidth * 0.9, window.innerHeight * 0.9);
  const color = getBackgroundColor();
  imageBuffer.value.canvas.backgroundColor = `rgb(${color }, ${color}, ${color})`;
  imageBuffer.value.canvas.on('path:created', (e) => {
    e.path.set({
      objectCaching: false,
      strokeLineCap: 'round',
      strokeLineJoin: 'round'
    });
  });
  imageBuffer.value!.canvas.on('object:moving', (e) => {
    if (!e.target) return;
    e.target.set({
      left: Math.round(e.target.left),
      top: Math.round(e.target.top)
    });
  });

  imageBuffer.value!.canvas.on('object:scaling', (e) => {
    if (!e.target) return;
    e.target.set({
      left: Math.round(e.target.left),
      top: Math.round(e.target.top),
      width: Math.round(e.target.width * e.target.scaleX),
      height: Math.round(e.target.height * e.target.scaleY),
      scaleX: 1,
      scaleY: 1
    });
  });
  imageBuffer.value!.canvas.renderAll();
  window.addEventListener('resize', handleCanvasResize);
  updateBrushSize();
});

onUnmounted(() => {
  window.removeEventListener('resize', imageBuffer.value!.resizeCanvas);
});




window.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    var element = e.target as HTMLElement;     
    if (element.tagName !== "INPUT") { 
        deleteActiveObject();
    }  
    
  }
  const isCmdOrCtrl = e.metaKey || e.ctrlKey;

  if (isCmdOrCtrl && e.key === 'c') {
    e.preventDefault();
    copyObject();
  }
  if (isCmdOrCtrl && e.key === 'v') {
    e.preventDefault();
    e.stopPropagation();
    pasteObject();
  }
});

</script>
<template>
  <div class="canvas-wrapper">
    <Toolbar 
      @toggleBrush="imageBuffer?.toggleBrush()"
      @updateBrush="() => updateBrushSize()"
      @updateColor="() => updateObjectColor()"
      @addObject="handleAddObject"
      @applyTransform="handleTransform"
      @applyFilter="handleFilter"
      @clearCanvas="clearCanvas"
      @fitCanvasToObjects="fitCanvasToObjects"
      @fitCanvasToScreen="fitCanvasToScreen"
      @addNoise="handleAddNoise"
      @resizeCanvasOptimal="resizeCanvasOptimal"
      @updateBackground="updateBackgroundColor"
    />
    <div class="canvas-border-frame">
      <canvas ref="canvasObject" id="imageCanvas"></canvas>
    </div>
  </div>
</template> 

<style lang="css">
html, body {
  margin: 0;
  padding: 0;
  background-color: #121212;
  box-sizing: border-box;
}
/* Main Page Container */
.canvas-wrapper {
  background-color: #ffffff;
  color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Optional border around the canvas area without interfering with Fabric layers */
.canvas-border-frame {
  border: 1px solid #a8a6a6;
  display: inline-block;
  line-height: 0; /* Eliminates baseline gap under canvas */
}
</style>