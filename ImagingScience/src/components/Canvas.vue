

<script setup lang="ts">
import { ref, onMounted, onUnmounted, useTemplateRef,shallowRef , type ShallowRef } from 'vue';
import { Canvas, Rect, FabricImage, PencilBrush, Circle, FabricObject, ActiveSelection } from 'fabric'; 
import { ImageBuffer } from '../composables/ImageBuffer.ts'
import { getFFT, getDCT, getDWT } from '../composables/useTransforms.ts'
import { getSimpleEdges, getCannys, getHighpassFilter, getLowpassFilter, getGammaCorrection } from '../composables/filters.ts'
import { useImageBufferState } from '../composables/useImageBufferState.ts';

const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();
// Reference to the canvas object
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasObject");

const brushSize = ref(10);

// Actual canvas object from fabric

const handleCanvasResize = () => {
  imageBuffer.value!.resizeCanvas();
}
onMounted(() => {
  if (!canvasRef.value) return;
  imageBuffer.value = new ImageBuffer(canvasRef.value, window.innerWidth * 0.9, window.innerHeight * 0.9);
  imageBuffer.value.canvas.backgroundColor = "white";
  imageBuffer.value.canvas.on('path:created', (e) => {
  e.path.set({
    objectCaching: false,
    strokeLineCap: 'round',
    strokeLineJoin: 'round'
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
});
  window.addEventListener('resize', handleCanvasResize);
  updateBrushSize();
});

onUnmounted(() => {
  window.removeEventListener('resize', imageBuffer.value!.resizeCanvas);
});

function getObjectGrayscale(obj : FabricObject) {
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


const addBox = () => {
  const canvas = imageBuffer.value?.canvas;
  if (!canvas) return;
  var colorSelector = document.getElementById("objectColorSelector");
  const color = (colorSelector! as HTMLSelectElement).value
  const rect = new Rect({
    left: 100,
    top: 100,
    fill: `rgb(${color }, ${color}, ${color})`,
    width: 60,
    height: 60,
    uniformScaling: false,
    uniScaleKey: 'shiftKey',
  });
  canvas.add(rect);
  rect.on("selected", () => {
    var colorSelector = document.getElementById("objectColorSelector");
    
    (colorSelector! as HTMLSelectElement).value = getObjectGrayscale(rect).toString();
  })
  canvas.setActiveObject(rect);
};
const addCircle = () => {
  const canvas = imageBuffer.value?.canvas;
  if (!canvas) return;
  var colorSelector = document.getElementById("objectColorSelector");
  const color = (colorSelector! as HTMLSelectElement).value
  const rect = new Circle({
    left: 100,
    top: 100,
    fill: `rgb(${color}, ${color}, ${color})`,
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
    (colorSelector! as HTMLSelectElement).value = getObjectGrayscale(rect).toString();
  })
  canvas.setActiveObject(rect);
};
const addGaussian = () => {
  const canvas = imageBuffer.value?.canvas; 
  if (!canvas) return;
  const gaussianObj = createGaussianImage(canvas.width +100, canvas.height+100, 10);
  canvas.add(gaussianObj);
  canvas.setActiveObject(gaussianObj);
};

function createGaussianImage(width: number, height: number, sigma: number) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    const imgData = ctx!.createImageData(width, height);
    
    const cx = width / 2;
    const cy = height / 2;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            // Gaussian math
            const dist = Math.pow(x - cx, 2) + Math.pow(y - cy, 2);
            const val = Math.exp(-dist / (2 * sigma * sigma)) * 255;
            
            imgData.data[idx]     = val; // R
            imgData.data[idx + 1] = val; // G
            imgData.data[idx + 2] = val; // B
            imgData.data[idx + 3] = 255; // A
        }
    }
    ctx!.putImageData(imgData, 0, 0);
    return new FabricImage(tempCanvas);
}


const updateObjectColor = () => {
    const colorSelectorValue = (document.getElementById("objectColorSelector")! as HTMLSelectElement).value;
    if (imageBuffer.value!.isDrawing && imageBuffer.value!.canvas.freeDrawingBrush) {
        imageBuffer.value!.canvas.freeDrawingBrush.color = `rgb(${colorSelectorValue}, ${colorSelectorValue}, ${colorSelectorValue})`;
    }

    var obj = imageBuffer.value!.canvas.getActiveObject();
    if (!obj) return;
    obj.set("fill", `rgb(${colorSelectorValue}, ${colorSelectorValue}, ${colorSelectorValue})`);
    imageBuffer.value!.canvas.renderAll();
}

const clearCanvas = () => {
    imageBuffer.value!.canvas.clear();
    imageBuffer.value!.canvas.backgroundColor = "white";
}

const deleteActiveObject = () => {
  if (!imageBuffer.value!.canvas) return;
  const activeObjects = imageBuffer.value!.canvas.getActiveObjects();

  if (activeObjects.length > 0) {
    activeObjects.forEach((obj) => {
      imageBuffer.value!.canvas.remove(obj);
    });

    imageBuffer.value!.canvas.discardActiveObject();
    imageBuffer.value!.canvas.renderAll();
  }
};

const updateBrushSize = () => {
    brushSize.value = Number((document.getElementById("brushSize")!as HTMLSelectElement).value);
    if (imageBuffer.value!.canvas.freeDrawingBrush) {
        imageBuffer.value!.canvas.freeDrawingBrush.width = brushSize.value;
    }
}

let clipboard : FabricObject;

const copyObject = async () => {
  if (!imageBuffer.value!.canvas) return;

  const activeObject = imageBuffer.value!.canvas.getActiveObject();
  if (!activeObject) return;

  clipboard = await activeObject.clone();
};

const pasteObject = async () => {
  const canvas = imageBuffer.value?.canvas;
  if (!canvas || !clipboard) return;

  const clonedObj = await clipboard.clone();

  canvas.discardActiveObject();

  clonedObj.set({
    left: clonedObj.left + 20,
    top: clonedObj.top + 20,
    evented: true,
  });

  if (clonedObj.type === 'activeSelection') {
    const selection = clonedObj as ActiveSelection;
    
    selection.canvas = canvas;
    selection.forEachObject((obj) => {
      canvas.add(obj);
    });
    
    selection.setCoords();
  } else {
    imageBuffer.value!.canvas.add(clonedObj);
  }

  canvas.setActiveObject(clonedObj);
  canvas.renderAll();
};



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
    pasteObject();
  }
});

</script>
<template>
    <div class="canvas-container">
    <div class="toolbar">
      <button @click="updateBrushSize(); imageBuffer!.toggleBrush()">
        {{ imageBuffer?.isDrawing.value ? 'Stop Drawing' : 'Draw with Brush' }}
      </button>
      <label>Brush size: </label><input type="range" min="1" max="100" id="brushSize" @input="updateBrushSize" value="10">
      <button @click="addBox">Add Rectangle</button>
      <button @click="addCircle">Add Circle</button>
      <button @click="addGaussian">Add Gaussian</button>
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
