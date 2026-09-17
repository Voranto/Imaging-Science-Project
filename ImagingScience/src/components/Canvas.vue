

<script setup>
import { ref, onMounted, onUnmounted, useTemplateRef } from 'vue';
import { Canvas, Rect, FabricImage, PencilBrush } from 'fabric'; 
import { useCanvasState } from '../composables/useCanvas.js'

const canvasRef = useTemplateRef("canvasObject");
const { canvasInstance } = useCanvasState();
const { setCanvas } = useCanvasState();
const isDrawing = ref(false)


const resizeCanvas = () => {
  if (!canvasRef.value) return;
  canvas.setDimensions({
    width: window.innerWidth * 0.9,
    height: window.innerHeight * 0.9
  });
};


var canvas = ref(null);
onMounted(() => {
  canvas = new Canvas(canvasRef.value, {uniformScaling: false,});
  window.addEventListener('resize', resizeCanvas);
  setCanvas(canvas);
  resizeCanvas();
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  setCanvas(null);
});

const toggleBrush = () => {
  isDrawing.value = !isDrawing.value;
  canvas.isDrawingMode = isDrawing.value;
  canvas.freeDrawingBrush = new PencilBrush(canvas);
  var colorSelector = document.getElementById("objectColorSelector");
  if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.width = 5;
    canvas.freeDrawingBrush.color = colorSelector.value;
  }
};
const addBox = () => {
  if (!canvas) return;
  const rect = new Rect({
    left: 100,
    top: 100,
    fill: '#0000ff',
    width: 60,
    height: 60,
    uniformScaling: false,
    uniScaleKey: 'shiftKey'
  });
  canvas.add(rect);
  rect.on("selected", () => {
    var colorSelector = document.getElementById("objectColorSelector");
    colorSelector.value = rect.fill;
  })
  canvas.setActiveObject(rect);
};
const updateObjectColor = () => {
    const colorSelectorValue = document.getElementById("objectColorSelector").value;
    if (isDrawing) {
        canvas.freeDrawingBrush.color = colorSelectorValue;
    }

    var obj = canvas.getActiveObject();
    if (!obj) return;
    obj.set("fill", colorSelectorValue);
    canvas.renderAll();
}

const clearCanvas = () => {
     canvas.clear();
}
</script>
<template>
    <div class="canvas-container">
    <div class="toolbar">
      <button @click="toggleBrush">
        {{ isDrawing ? 'Stop Drawing' : 'Draw with Brush' }}
      </button>
      <button @click="addBox">Add Rectangle</button>
      <input type="color" id="objectColorSelector" @input="updateObjectColor">
      <button @click="clearCanvas">Clear Canvas</button>
    </div>

    <canvas ref="canvasObject" id="imageCanvas" style="border:1px solid #000000;"></canvas>
  </div>
</template> 