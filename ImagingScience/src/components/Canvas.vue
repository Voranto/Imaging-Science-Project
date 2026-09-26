

<script setup lang="ts">
import { ref, onMounted, onUnmounted, useTemplateRef,shallowRef , type ShallowRef } from 'vue';
import { Canvas, Rect, FabricImage, PencilBrush, Circle, FabricObject, ActiveSelection } from 'fabric'; 
import { ImageBuffer, getObjectGrayscale } from '../composables/ImageBuffer.ts'
import { getFFT, getDCT, getDWT } from '../composables/transform/useTransforms.ts'
import { getSimpleEdges, getCannys, getHighpassFilter, getLowpassFilter, getGammaCorrection, getCornerTomasi, getCornerRohr, getCornerHarris } from '../composables/filters/useFilter.ts'
import { useImageBufferState } from '../composables/useImageBufferState.ts';
import Toolbar from './Toolbar.vue';
import { applyUniformNoise, applyGaussianNoise, applyMultiplicativeUniformNoise, applyMultiplicativeGaussianNoise, applyImpulseNoise } from '@/composables/noise/applyNoise.ts';
const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();
// Reference to the canvas object
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasObject");

const brushSize = ref(10);

const canvasFitToScreen = ref(true);
// Actual canvas object from fabric
const handleCanvasResize = () => {
  if (!canvasFitToScreen.value) return;

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




const addBox = () => {
  const canvas = imageBuffer.value?.canvas;
  if (!canvas) return;
  var colorSelector = document.getElementById("objectColorSelector");
  var color = (colorSelector as HTMLSelectElement).value;
  const rect = new Rect({
    left: 100,
    top: 100,
    fill: `rgb(${color }, ${color}, ${color})`,
    originX: 'left',
    originY: 'top',
    width: 60,
    height: 60,
    uniformScaling: false,
    uniScaleKey: 'shiftKey',
  });
  rect.set("customType", "rect")
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
    originX: 'left',
    originY: 'top',
    uniformScaling: false,
    uniScaleKey: 'shiftKey',
    objectCaching: false,     
    strokeWidth: 0,           
    strokeUniform: true,
    noScaleCache: true,
  });
  rect.set("customType", "circle");
  canvas.add(rect);
  rect.on("selected", () => {
    var colorSelector = document.getElementById("objectColorSelector");
    (colorSelector! as HTMLSelectElement).value = getObjectGrayscale(rect).toString();
  })
  canvas.setActiveObject(rect);
};
const addGaussian = (sigma: number) => {
  const canvas = imageBuffer.value?.canvas; 
  if (!canvas) return;
  var height = canvas.height;
  var width = canvas.width;
  const gaussianObj = createGaussianImage(width, height, sigma);
  gaussianObj.set({
    originX: 'left',
    originY: 'top',
  });
  gaussianObj.set("customType", "gaussian");
  gaussianObj.set("sigma", sigma.toString())
  canvas.add(gaussianObj);
  canvas.setActiveObject(gaussianObj);
};

function createGaussianImage(rawWidth: number, rawHeight: number, sigma: number) {
    const height = Math.floor(rawHeight);
    const width = Math.floor(rawWidth)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = Math.floor(width);
    tempCanvas.height = Math.floor(height);
    const ctx = tempCanvas.getContext('2d');
    const imgData = ctx!.createImageData(Math.floor(width), Math.floor(height));
    
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
  var colorSelector = document.getElementById("objectColorSelector");
  const c = (colorSelector as HTMLSelectElement).value;
    if (imageBuffer.value!.isDrawing && imageBuffer.value!.canvas.freeDrawingBrush) {
        imageBuffer.value!.canvas.freeDrawingBrush.color = `rgb(${c}, ${c}, ${c})`;
    }
    var obj = imageBuffer.value!.canvas.getActiveObject();
    if (!obj) return;
    obj.set("fill", `rgb(${c}, ${c}, ${c})`);
    imageBuffer.value!.canvas.renderAll();
    imageBuffer.value?.syncFloatBuffer();
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

const handleAddObject = ({ shape, gaussianSigma }: { shape: string, gaussianSigma:number }) => {
  if (shape === 'box') addBox();
  else if (shape === 'circle') addCircle();
  else if (shape === 'gaussian') addGaussian(gaussianSigma);
};

const handleTransform = (type: string) => {
  if (type === 'fft') getFFT();
  if (type === 'dct') getDCT();
  if (type === 'dwt') getDWT();
};

const handleFilter = (type: string) => {
  if (type === 'simple-edge') getSimpleEdges();
  if (type === 'canny') getCannys();
  if (type === 'highpass') getHighpassFilter();
  if (type === 'lowpass') getLowpassFilter();
  if (type === 'gamma') getGammaCorrection();
  if (type === 'tomasi') getCornerTomasi();
  if (type === 'rohr') getCornerRohr();
  if (type === 'harris') getCornerHarris();
};
const handleAddNoise = (type: string) => {
  if (type === 'uniform') applyUniformNoise();
  if (type === 'gaussian') applyGaussianNoise();
  if (type === 'multiplicative-uniform') applyMultiplicativeUniformNoise();
  if(type == "multiplicative-gaussian") applyMultiplicativeGaussianNoise();
  if(type == "impulse") applyImpulseNoise();
};

const fitCanvasToObjects = () => {
  canvasFitToScreen.value = false;
  const canvas = imageBuffer.value?.canvas;
  if (!canvas) return;
  const objects = canvas.getObjects();
  if (objects.length === 0) {
    console.error("No objects to fit the canvas to");
  }
  var minX = canvas.width;
  var minY = canvas.height;
  var maxX = 0;
  var maxY = 0;
  for (const obj of objects) {
    const boundingRect = obj.getBoundingRect();

    minX = Math.min(minX, boundingRect.left);
    minY = Math.min(minY, boundingRect.top);
    maxX = Math.max(maxX, boundingRect.left + boundingRect.width);
    maxY = Math.max(maxY, boundingRect.top + boundingRect.height);
  }

  minX = Math.max(0, minX);
  minY = Math.max(0, minY);
  maxX = Math.min(canvas.width, maxX);
  maxY = Math.min(canvas.height, maxY);

  if (minX >= maxX || minY >= maxY) {
    console.error("Something went wrong with the dimensions");
  }
  for (const obj of objects) {
    obj.set({
      left: obj.left - minX,
      top: obj.top - minY,
    });
    obj.setCoords(); 
  }
  imageBuffer.value?.setCanvasDimensions(maxY - minY, maxX - minX);
  canvas.renderAll();
}
const fitCanvasToScreen = () => {
  canvasFitToScreen.value = true;
  handleCanvasResize();
}
</script>
<template>
    <div class="canvas-container">
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
    />
    <canvas ref="canvasObject" id="imageCanvas" style="border:1px solid #000000"></canvas>
  </div>
</template> 
