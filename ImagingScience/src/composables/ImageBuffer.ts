import { Canvas, FabricObject, PencilBrush, FabricImage } from 'fabric';
import {ref, type Ref} from 'vue';
export class ImageBuffer {
    public canvas: Canvas;
    public floatBuffer: Float32Array;
    public width: number;
    public height: number;
    public isDrawing: Ref<boolean>;
    
    constructor(canvasElement: HTMLCanvasElement, width: number, height: number) {
    this.width = Math.floor(width);
    this.height = Math.floor(height);
    this.canvas = new Canvas(canvasElement, { width, height });
    this.floatBuffer = new Float32Array(this.width * this.height);

    this.isDrawing = ref(false);
    this.initEventListeners();
    this.canvas.freeDrawingBrush = new PencilBrush(this.canvas);
  }

  private initEventListeners() {
    this.canvas.on('object:modified', () => this.syncFloatBuffer());
    this.canvas.on('object:added', () => this.syncFloatBuffer());
    this.canvas.on('object:removed', () => this.syncFloatBuffer());
  }
  public syncFloatBuffer() {
    this.floatBuffer.fill(1.0);

    const objects = this.canvas.getObjects();

    for (const obj of objects) {
      this.rasterizeObject(obj);
    }

    console.log("Float buffer synchronized with Fabric.js objects.");
  }

  public resizeCanvas() {
    const newWidth = window.innerWidth * 0.9;
    const newHeight = window.innerHeight * 0.9;

    this.width = Math.floor(newWidth);
    this.height = Math.floor(newHeight);
    this.canvas.setDimensions({
      width: newWidth,
      height: newHeight
    });

    this.floatBuffer = new Float32Array(Math.floor(newWidth) * Math.floor(newHeight));
    
    this.canvas.renderAll();
    this.syncFloatBuffer();
  }

  public toggleBrush() {
    this.isDrawing.value = !this.isDrawing.value;
    this.canvas.isDrawingMode = this.isDrawing.value;
    
  };

  private rasterizeObject(obj: FabricObject) {
    const objectType : string = (obj as any).customType;
    if (objectType == "rect") {
        this.rasterizeRect(obj);
    }
    else if (objectType == "circle") {
      this.rasterizeCircle(obj);
    }
    else if (objectType == "gaussian") {
      console.log("gaussian")
      this.rasterizeGaussian(obj);
    }
    else if (objectType == "image") {
      this.rasterizeImage(obj as FabricImage);
    }

  }
  private rasterizeRect(obj : FabricObject) {
    const rectW = (obj.width || 0) * (obj.scaleX || 1);
    const rectH = (obj.height || 0) * (obj.scaleY || 1);
    const left = obj.left!;
    const top = obj.top!;

    const minX = Math.max(0, Math.floor(left));
    const maxX = Math.min(this.width, Math.ceil(left + rectW));
    const minY = Math.max(0, Math.floor(top));
    const maxY = Math.min(this.height, Math.ceil(top + rectH));
    const color = getObjectGrayscale(obj) / 255.0;
    console.log(color);
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        const idx = y * this.width + x;
        if (idx===0) console.log(idx);
        this.floatBuffer[idx] = color;
      }
    }
  }
  private rasterizeCircle(obj : FabricObject) {
    const width = (obj.width || 0) * (obj.scaleX || 1);
    const height = (obj.height || 0) * (obj.scaleY || 1);
    const left = obj.left!;
    const top = obj.top!;

    const rx = width / 2;
    const ry = height / 2;
    const cx = obj.left! + rx;
    const cy = obj.top! + ry;

    const minX = Math.max(0, Math.floor(left));
    const maxX = Math.min(this.width, Math.ceil(left + width));
    const minY = Math.max(0, Math.floor(top));
    const maxY = Math.min(this.height, Math.ceil(top + height));
    const color = getObjectGrayscale(obj) / 255.0;

    const rxSq = rx * rx;
    const rySq = ry * ry;
    for (let y = minY; y < maxY; y++) {
    const dy = (y + 0.5) - cy;
    const dySq = dy * dy;

    for (let x = minX; x < maxX; x++) {
      const dx = (x + 0.5) - cx; 

      if ((dx * dx) / rxSq + (dySq / rySq) <= 1.0) {
        const idx = y * this.width + x;
        this.floatBuffer[idx] = color;
      }
    }
  }
  }

  private rasterizeGaussian(obj : FabricObject) {
    const width = (obj.width || 0) * (obj.scaleX || 1);
    const height = (obj.height || 0) * (obj.scaleY || 1);
    const left = obj.left!;
    const top = obj.top!;

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const minX = Math.max(0, Math.floor(left));
    const maxX = Math.min(this.width, Math.ceil(left + width));
    const minY = Math.max(0, Math.floor(top));
    const maxY = Math.min(this.height, Math.ceil(top + height));
    console.log(minX,minY,maxX,maxY)
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
          const dx = (x + 0.5) - centerX;
          const dy = (y + 0.5) - centerY;
          const distSq = dx * dx + dy * dy;

          const val = Math.exp(-distSq / (2 * (obj as any).sigma * (obj as any).sigma));
          const idx = y * this.width + x;

          this.floatBuffer[idx] = Math.min(1.0, val);
      }
    }
    console.log(this.floatBuffer)
}
  private rasterizeImage(obj : FabricImage){
    const width = Math.floor(obj.width || 0) * (obj.scaleX || 1);
    const height = Math.floor(obj.height || 0) * (obj.scaleY || 1);
    const left = obj.left!;
    const top = obj.top!;

    const minX = Math.max(0, Math.floor(left));
    const maxX = Math.min(this.width, Math.ceil(left + width));
    const minY = Math.max(0, Math.floor(top));
    const maxY = Math.min(this.height, Math.ceil(top + height));
    const ctx = this.canvas.getContext();
    const imageData = ctx.getImageData(minX,minY, (maxX - minX),(maxY - minY)).data;

    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
          const localIdx = (y - minY) * (maxX - minX) + (x-minX);
          const bufferIdx = y * this.width + x;
          this.floatBuffer[bufferIdx] = imageData[localIdx * 4]! / 255;
      }
    }
    console.log(this.floatBuffer)
  }
}

export function getObjectGrayscale(obj : FabricObject) {
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