

<script setup>
import { ref, onMounted, onUnmounted, useTemplateRef } from 'vue';
import { Canvas, Rect, FabricImage, PencilBrush, Circle } from 'fabric'; 
import { useCanvasState } from '../composables/useCanvas.ts'
import { getFFT, getDCT, getDWT } from '../composables/useTransforms.ts'
import { getSimpleEdges, getCannys, getHighpassFilter, getLowpassFilter, getGammaCorrection } from '../composables/filters.ts'

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
  canvas = new Canvas(canvasRef.value, {uniformScaling: false,enableRetinaScaling: false, imageSmoothing: false,snapAngle: 0,
    snapThreshold: null});
  const lowerCanvasEl = canvas.getElement();
  if (lowerCanvasEl) {
    // Re-initialize 2D context properties
    const ctx = lowerCanvasEl.getContext('2d', {
      alpha: false,
      willReadFrequently: true,
      colorSpace: 'srgb'
    });
    
    if (ctx) ctx.imageSmoothingEnabled = false;
  }
  canvas.backgroundColor = "white";
  canvas.on('path:created', (e) => {
  e.path.set({
    objectCaching: false,
    strokeLineCap: 'round',
    strokeLineJoin: 'round'
  });
  canvas.on('object:moving', (e) => {
  if (!e.target) return;
  e.target.set({
    left: Math.round(e.target.left),
    top: Math.round(e.target.top)
  });
});

canvas.on('object:scaling', (e) => {
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

function getObjectGrayscale(obj) {
  const fill = obj.fill;
  if (!fill || typeof fill !== 'string') return 0;

  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return 0;
  
  ctx.fillStyle = fill;
  const computedHex = ctx.fillStyle; 

  const r = parseInt(computedHex.substring(1, 3), 16);
  const g = parseInt(computedHex.substring(3, 5), 16);
  const b = parseInt(computedHex.substring(5, 7), 16);

  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

const toggleBrush = () => {
  isDrawing.value = !isDrawing.value;
  canvas.isDrawingMode = isDrawing.value;
  canvas.freeDrawingBrush = new PencilBrush(canvas);
  var colorSelector = document.getElementById("objectColorSelector");
  if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = `rgb(${colorSelector.value}, ${colorSelector.value}, ${colorSelector.value})`;
  }
};
const addBox = () => {
  if (!canvas) return;
  var colorSelector = document.getElementById("objectColorSelector");
  const rect = new Rect({
    left: 100,
    top: 100,
    fill: `rgb(${colorSelector.value}, ${colorSelector.value}, ${colorSelector.value})`,
    width: 60,
    height: 60,
    uniformScaling: false,
    uniScaleKey: 'shiftKey',
    objectCaching: false,     // Prevents Fabric from rasterizing to an offscreen anti-aliased canvas
    strokeWidth: 0,           // Ensures no anti-aliased border outline is computed
    strokeUniform: true,
    noScaleCache: true,
  });
  canvas.add(rect);
  rect.on("selected", () => {
    var colorSelector = document.getElementById("objectColorSelector");
    colorSelector.value = getObjectGrayscale(rect);
  })
  canvas.setActiveObject(rect);
};
const addCircle = () => {
  if (!canvas) return;
  var colorSelector = document.getElementById("objectColorSelector");
  const rect = new Circle({
    left: 100,
    top: 100,
    fill: `rgb(${colorSelector.value}, ${colorSelector.value}, ${colorSelector.value})`,
    radius: 60,
    uniformScaling: false,
    uniScaleKey: 'shiftKey',
    objectCaching: false,     
    strokeWidth: 0,           
    strokeUniform: true,
    noScaleCache: true,
  });
  canvas.add(rect);
  rect.on("selected", () => {
    var colorSelector = document.getElementById("objectColorSelector");
    colorSelector.value = getObjectGrayscale(rect);
  })
  canvas.setActiveObject(rect);
};
const updateObjectColor = () => {
    const colorSelectorValue = document.getElementById("objectColorSelector").value;
    if (isDrawing && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = `rgb(${colorSelectorValue}, ${colorSelectorValue}, ${colorSelectorValue})`;
    }

    var obj = canvas.getActiveObject();
    if (!obj) return;
    obj.set("fill", `rgb(${colorSelectorValue}, ${colorSelectorValue}, ${colorSelectorValue})`);
    canvas.renderAll();
}

const clearCanvas = () => {
     canvas.clear();
     canvas.backgroundColor = "white";
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
      <button @click="addCircle">Add Circle</button>
      <input type="range" min="0" max="255" id="objectColorSelector" @input="updateObjectColor">
      <button @click="clearCanvas">Clear Canvas</button>
      <button @click="getFFT">Generate FFT</button>
      <button @click="getDCT">Generate DCT</button>
      <button @click="getDWT">Generate DWT</button>
      <button @click="getSimpleEdges">Simple Edge Detector</button>
      <button @click="getCannys">Cannys Edge Detector</button>
      <button @click="getHighpassFilter">Highpass Filter</button>
      <button @click="getLowpassFilter">Lowpass Filter</button>
      <button @click="getGammaCorrection">Gamma Correction</button>
    </div>

    <canvas ref="canvasObject" id="imageCanvas" style="border:1px solid #000000"></canvas>
  </div>
</template> 
