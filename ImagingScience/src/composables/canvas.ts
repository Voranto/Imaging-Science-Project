import { ActiveSelection, Circle, controlsUtils, FabricImage, FabricObject, Rect } from "fabric";
import { useImageBufferState } from "./useImageBufferState";
import { getColorSelector, setColorSelector } from "./objectColor";
import { getObjectGrayscale } from "./ImageBuffer";
import { getBackgroundColor } from "./backgroundColor";
import { ref } from "vue";
import { getDCT, getDWT, getFFT } from "./transform/useTransforms";
import { applyGaussianNoise, applyImpulseNoise, applyMultiplicativeGaussianNoise, applyMultiplicativeUniformNoise, applyUniformNoise } from "./noise/applyNoise";
import { scales } from "chart.js";

const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();
export const brushSize = ref(10);
export const canvasFitToScreen = ref(true);

export const addBox = () => {
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
    lockSkewingX: true,
    lockSkewingY: true,
  });
  rect.set("customType", "rect")
  addEventListenersObject(rect);
  canvas.add(rect);
  canvas.setActiveObject(rect);
};
export const addCircle = () => {
  const canvas = imageBuffer.value?.canvas;
  if (!canvas) return;
  var colorSelector = document.getElementById("objectColorSelector");
  const color = (colorSelector! as HTMLSelectElement).value
  const circle = new Circle({
    left: 100,
    top: 100,
    fill: `rgb(${color}, ${color}, ${color})`,
    radius: 60,
    originX: 'left',
    originY: 'top',
    uniformScaling: false,
    uniScaleKey: 'shiftKey',
    lockSkewingX: true,
    lockSkewingY: true,
  });
  circle.set("customType", "circle");
  addEventListenersObject(circle);
  canvas.add(circle);
  canvas.setActiveObject(circle);
};
export const addGaussian = (sigma: number) => {
  const canvas = imageBuffer.value?.canvas; 
  if (!canvas) return;
  var height = canvas.height;
  var width = canvas.width;
  const gaussianObj = createGaussianImage(width, height, sigma);
  gaussianObj.set({
    originX: 'left',
    originY: 'top',
    lockSkewingX: true,
    lockSkewingY: true,
    lockRotation: true,
  });
  gaussianObj.set("customType", "gaussian");
  gaussianObj.set("sigma", sigma.toString())
  addEventListenersObject(gaussianObj);
  canvas.add(gaussianObj);
  canvas.setActiveObject(gaussianObj);
};
export const addSinusoidal = (cyclesX : number, cyclesY : number) => {
  const canvas = imageBuffer.value?.canvas; 
  if (!canvas) return;
  var height = canvas.height;
  var width = canvas.width;
  const sineObj = createSinusoidalImage(width, height, cyclesX, cyclesY);
  sineObj.set({
    originX: 'left',
    originY: 'top',
    lockSkewingX: true,
    lockSkewingY: true,
    lockRotation: true,
  });
  sineObj.set("customType", "sinusoidal");
  sineObj.set("cyclesX", cyclesX.toString())
  sineObj.set("cyclesY", cyclesY.toString())
  addEventListenersObject(sineObj);
  canvas.add(sineObj);
  canvas.setActiveObject(sineObj);
}
export const addCheckerboard = (rows : number, columns : number) => {
  const canvas = imageBuffer.value?.canvas; 
  if (!canvas) return;
  var height = canvas.height;
  var width = canvas.width;
  const checkerboardObj = createCheckerboard(width, height, rows, columns);
  checkerboardObj.set({
    originX: 'left',
    originY: 'top',
    lockSkewingX: true,
    lockSkewingY: true,
    lockRotation: true,
  });

  checkerboardObj.set("customType", "checkerboard");
  checkerboardObj.set("rows", rows.toString())
  checkerboardObj.set("columns", columns.toString())
  addEventListenersObject(checkerboardObj);
  canvas.add(checkerboardObj);
  canvas.setActiveObject(checkerboardObj);
}

export function createGaussianImage(rawWidth: number, rawHeight: number, sigma: number) {
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
export function createSinusoidalImage(rawWidth: number, rawHeight: number, cyclesX: number, cyclesY: number) {
    const height = Math.floor(rawHeight);
    const width = Math.floor(rawWidth)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = Math.floor(width);
    tempCanvas.height = Math.floor(height);
    const ctx = tempCanvas.getContext('2d');
    const imgData = ctx!.createImageData(Math.floor(width), Math.floor(height));
    const freqX = (2 * Math.PI * cyclesX) / width;
    const freqY = (2 * Math.PI * cyclesY) / height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const val = 127.5 * computeCosine2D(x * freqX, y * freqY) + 127.5;
            
            imgData.data[idx]     = val; // R
            imgData.data[idx + 1] = val; // G
            imgData.data[idx + 2] = val; // B
            imgData.data[idx + 3] = 255; // A
        }
    }
    ctx!.putImageData(imgData, 0, 0);
    return new FabricImage(tempCanvas);
}
export function createCheckerboard(rawWidth: number, rawHeight: number, rows: number, columns: number) { 
  const height = Math.floor(rawHeight);
    const width = Math.floor(rawWidth)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = Math.floor(width);
    tempCanvas.height = Math.floor(height);
    const ctx = tempCanvas.getContext('2d');
    const imgData = ctx!.createImageData(Math.floor(width), Math.floor(height));
    const cellWidth =  width / columns;
    const cellHeight = height / rows;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            const posX = (Math.floor(x  / cellWidth + 1/2) % 2) * 2 - 1;
            const posY = (Math.floor(y / cellHeight + 1/2) % 2) * 2 - 1;
            const val = posX * posY;
            var color = 255;
            if (val == -1) color = 0;
            imgData.data[idx]     = color; // R
            imgData.data[idx + 1] = color; // G
            imgData.data[idx + 2] = color; // B
            imgData.data[idx + 3] = 255; // A
        }
    }
    ctx!.putImageData(imgData, 0, 0);
    return new FabricImage(tempCanvas);
}
export const computeCosine2D = (x : number, y : number) => {
  return Math.cos(x) * Math.cos(y);
}

export const addEventListenersObject = (obj : FabricObject) => {
  const type = (obj as any).customType;
  if (type === "rect" || type === "circle") {
    obj.on("selected", () => {
      setColorSelector(getObjectGrayscale(obj));
    })
  }
}

export const updateObjectColor = () => {
  const c = getColorSelector();
  if (imageBuffer.value!.isDrawing && imageBuffer.value!.canvas.freeDrawingBrush) {
      imageBuffer.value!.canvas.freeDrawingBrush.color = `rgb(${c}, ${c}, ${c})`;
  }
  var objs = imageBuffer.value!.canvas.getActiveObjects();
  for (const obj of objs){
    if (!obj) return;
    obj.set("fill", `rgb(${c}, ${c}, ${c})`);
  }
  
  imageBuffer.value!.canvas.renderAll();
  imageBuffer.value?.syncFloatBuffer();
}

export const clearCanvas = () => {
    imageBuffer.value!.canvas.clear();
    const color = getBackgroundColor();
    updateBackgroundColor();
}

export const deleteActiveObject = () => {
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

export const updateBrushSize = () => {
    brushSize.value = Number((document.getElementById("brushSize")!as HTMLSelectElement).value);
    if (imageBuffer.value!.canvas.freeDrawingBrush) {
        imageBuffer.value!.canvas.freeDrawingBrush.width = brushSize.value;
    }
}

let clipboard : Array<FabricObject>;
let pasteOffsetCount = 0;
export const copyObject = async () => {
  if (!imageBuffer.value!.canvas) return;

  const activeObjects = imageBuffer.value!.canvas.getActiveObjects();
  if (!activeObjects || activeObjects.length === 0) return;
  clipboard = [];
  pasteOffsetCount = 0;
  for (const activeObject of activeObjects){

    const center = activeObject.getCenterPoint();
    const cloned = await activeObject.clone(['customType']);
    (cloned as any).customType = (activeObject as any).customType;
    cloned.set({
      left: center.x - activeObject.width / 2,
      top: center.y - activeObject.height / 2,
      originX: 'left',
      originY: 'top',
    });
    clipboard.push(cloned);
  }  
};

export const pasteObject = async () => {
  const canvas = imageBuffer.value?.canvas;
  if (!canvas || !clipboard) return;
  canvas.discardActiveObject();
  pasteOffsetCount++;
  const offset = 20 * pasteOffsetCount;

  const newlyPastedObjects: FabricObject[] = [];
  for (const obj of clipboard){
    const clonedObj = await obj.clone(['customType']);
    const customType = (obj as any).customType;

    const coords = obj.getCenterPoint();
    coords.x -= obj.width / 2;
    coords.y -= obj.height / 2;
    clonedObj.set({
      left: coords.x + offset,
      top: coords.y + offset,
      evented: true,
      customType: customType,
      originX: 'left',
      originY: 'top',
    });
    (clonedObj as any).customType = customType;
    clonedObj.setCoords();
    
    addEventListenersObject(clonedObj);
    imageBuffer.value!.canvas.add(clonedObj);
    newlyPastedObjects.push(clonedObj);
  }
  if (newlyPastedObjects.length === 1) {
    canvas.setActiveObject(newlyPastedObjects[0]!);
  } else if (newlyPastedObjects.length > 1) {
    const selection = new ActiveSelection(newlyPastedObjects, {
      canvas: canvas,
    });
    canvas.setActiveObject(selection);
  }

  canvas.renderAll();
  imageBuffer.value?.syncFloatBuffer();
};




export const handleAddObject = ({ shape, gaussianSigma, sinusoidalCyclesX, sinusoidalCyclesY, checkerboardRows, checkerboardColumns }: { shape: string, gaussianSigma:number, sinusoidalCyclesX : number, sinusoidalCyclesY : number, checkerboardRows : number, checkerboardColumns : number }) => {
  if (shape === 'box') addBox();
  else if (shape === 'circle') addCircle();
  else if (shape === 'gaussian') addGaussian(gaussianSigma);
  else if (shape === 'sinusoidal') addSinusoidal(sinusoidalCyclesX, sinusoidalCyclesY);
  else if (shape === 'checkerboard') addCheckerboard(checkerboardRows, checkerboardColumns);
  imageBuffer.value?.syncFloatBuffer();
};

export const handleTransform = (type: string) => {
  if (type === 'fft') getFFT();
  if (type === 'dct') getDCT();
  if (type === 'dwt') getDWT();
};
export const handleAddNoise = (type: string) => {
  if (type === 'uniform') applyUniformNoise();
  if (type === 'gaussian') applyGaussianNoise();
  if (type === 'multiplicative-uniform') applyMultiplicativeUniformNoise();
  if(type == "multiplicative-gaussian") applyMultiplicativeGaussianNoise();
  if(type == "impulse") applyImpulseNoise();
};

export const fitCanvasToObjects = () => {
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
// Actual canvas object from fabric
export const handleCanvasResize = () => {
  if (!canvasFitToScreen.value) return;

  imageBuffer.value!.resizeCanvas();
}

export const fitCanvasToScreen = () => {
  canvasFitToScreen.value = true;
  handleCanvasResize();
}

// Find the smallest 2^n square
export const resizeCanvasOptimal = () => {
  const width = imageBuffer.value?.width.value;
  const height = imageBuffer.value?.height.value;
  if (!height || !width) return;

  const min_log = Math.round(Math.log2(Math.min(height,width)));
  
  const optimal_dimensions = Math.pow(2,min_log);
  imageBuffer.value?.setCanvasDimensions(optimal_dimensions, optimal_dimensions);
}
export const updateBackgroundColor = () => {
  const color = getBackgroundColor();
  imageBuffer.value!.canvas.backgroundColor = `rgb(${color }, ${color}, ${color})`;
  imageBuffer.value?.canvas.renderAll();
  imageBuffer.value?.syncFloatBuffer();
}