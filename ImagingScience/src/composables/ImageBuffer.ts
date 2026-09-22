import { Canvas, FabricObject, PencilBrush } from 'fabric';
import {ref, type Ref} from 'vue';
export class ImageBuffer {
    public canvas: Canvas;
    public floatBuffer: Float32Array;
    public width: number;
    public height: number;
    public isDrawing: Ref<boolean>;
    
    constructor(canvasElement: HTMLCanvasElement, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas = new Canvas(canvasElement, { width, height });
    this.floatBuffer = new Float32Array(width * height);

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
    this.floatBuffer.fill(0.0);

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

    this.floatBuffer = new Float32Array(newWidth * newHeight);

    this.canvas.renderAll();
    this.syncFloatBuffer();
  }

  public toggleBrush() {
    this.isDrawing.value = !this.isDrawing.value;
    this.canvas.isDrawingMode = this.isDrawing.value;
    
  };

  private rasterizeObject(obj: FabricObject) {
    console.log(obj);
  }
}