

<script setup>
import { ref, onMounted, onUnmounted, useTemplateRef } from 'vue';
import { Canvas, Rect, FabricImage, PencilBrush } from 'fabric'; 
import { useCanvasState } from '../composables/useCanvas.ts'
import { getFFT } from '../composables/useTransforms.ts'
// Reference to the canvas object
const canvasRef = useTemplateRef("canvasObject");

// Global canvas instance shared in useCanvas.js
const { canvasInstance } = useCanvasState();
const { setCanvas } = useCanvasState();

const isDrawing = ref(false)
var brushSize = 5;

const resizeCanvas = () => {
  if (!canvasRef.value) return;
  canvas.setDimensions({
    width: window.innerWidth * 0.9,
    height: window.innerHeight * 0.9
  });
};

// Actual canvas object from fabric
var canvas = ref(null);

onMounted(() => {
  canvas = new Canvas(canvasRef.value, {uniformScaling: false,});
  canvas.backgroundColor = "white";
  canvas.on('path:created', (e) => {
  e.path.set({
    objectCaching: false, // Prevents texture bitmap bounding box clipping
    strokeLineCap: 'round',
    strokeLineJoin: 'round'
  });
  canvas.renderAll();
});
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
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = colorSelector.value;
  }
};
const addBox = () => {
  if (!canvas) return;
  var colorSelector = document.getElementById("objectColorSelector");
  const rect = new Rect({
    left: 100,
    top: 100,
    fill: colorSelector.value,
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
    if (isDrawing && canvas.freeDrawingBrush) {
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

const deleteActiveObject = () => {
  if (!canvas) return;

  const activeObjects = canvas.getActiveObjects();

  if (activeObjects.length > 0) {
    activeObjects.forEach((obj) => {
      canvas.remove(obj);
    });

    canvas.discardActiveObject();
    canvas.renderAll();
  }
};

const updateBrushSize = () => {
    brushSize = document.getElementById("brushSize").value;
    if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = brushSize;
    }
}

let clipboard = null;

const copyObject = async () => {
  if (!canvas) return;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  clipboard = await activeObject.clone();
};

const pasteObject = async () => {
  if (!canvas || !clipboard) return;

  const clonedObj = await clipboard.clone();

  canvas.discardActiveObject();

  clonedObj.set({
    left: clonedObj.left + 20,
    top: clonedObj.top + 20,
    evented: true,
  });

  if (clonedObj.type === 'activeSelection') {
    clonedObj.canvas = canvas;
    clonedObj.forEachObject((obj) => {
      canvas.add(obj);
    });
    clonedObj.setCoordinates();
  } else {
    canvas.add(clonedObj);
  }

  canvas.setActiveObject(clonedObj);
  canvas.renderAll();
};



window.addEventListener('keydown', (e) => {
  if ((e.key === 'Delete' || e.key === 'Backspace') && e.target.tagName !== 'INPUT') {
    deleteActiveObject();
  }
  const isCmdOrCtrl = e.metaKey || e.ctrlKey;

  if (isCmdOrCtrl && e.key === 'c') {
    e.preventDefault();
    copyObject();
  }
  if (isCmdOrCtrl && e.key === 'v') {
    e.preventDefault();
    pasteObject();
  }
});

</script>
<template>
    <div class="canvas-container">
    <div class="toolbar">
      <button @click="toggleBrush">
        {{ isDrawing ? 'Stop Drawing' : 'Draw with Brush' }}
      </button>
      <label>Brush size: </label><input type="range" min="1" max="100" id="brushSize" @input="updateBrushSize" value="5">
      <button @click="addBox">Add Rectangle</button>
      <input type="color" id="objectColorSelector" @input="updateObjectColor">
      <button @click="clearCanvas">Clear Canvas</button>
      <button @click="getFFT">Generate FFT</button>
    </div>

    <canvas ref="canvasObject" id="imageCanvas" style="border:1px solid #000000;"></canvas>
  </div>
</template> 
