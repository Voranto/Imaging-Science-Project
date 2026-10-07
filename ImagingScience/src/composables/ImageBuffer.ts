import { Canvas, FabricObject, PencilBrush, FabricImage, Path, Point, Circle, type TDegree } from 'fabric';
import {ref, type Ref} from 'vue';
import { computeHistogram, renderHistogram } from './histogram';
import { getBackgroundColor } from './backgroundColor';
export class ImageBuffer {
    public canvas: Canvas;
    public floatBuffer: Float32Array;
    public width: Ref<number>;
    public height: Ref<number>;
    public isDrawing: Ref<boolean>;
    public mean: number;
    public variance: number;
    public autoResizeCanvas: Ref<boolean>;

    constructor(canvasElement: HTMLCanvasElement, width: number, height: number) {
    this.width = ref(Math.floor(width));
    this.height = ref(Math.floor(height));
    this.canvas = new Canvas(canvasElement, { width, height , enableRetinaScaling: false});
    this.floatBuffer = new Float32Array(this.width.value * this.height.value);
    this.floatBuffer.fill(getBackgroundColor() / 255);
    this.isDrawing = ref(false);
    this.initEventListeners();
    this.canvas.freeDrawingBrush = new PencilBrush(this.canvas);
    this.mean = 0;
    this.variance = 0;
    this.autoResizeCanvas = ref(true);
    const hist = computeHistogram(this.floatBuffer);
    renderHistogram(hist);
  }

  private initEventListeners() {
    this.canvas.on('object:modified', () => this.syncFloatBuffer());
    this.canvas.on('object:added', () => this.syncFloatBuffer());
    this.canvas.on('object:removed', () => this.syncFloatBuffer());
  }
  public async syncFloatBuffer() {
    // Have to wait before syncing float buffer, to avoid adding and then syncing
    await new Promise((resolve) => requestAnimationFrame(resolve));
    this.floatBuffer.fill(getBackgroundColor() / 255);

    const objects = this.canvas.getObjects();

    for (const obj of objects) {
      this.rasterizeObject(obj);
    }


    // Afterwards, compute all the stats
    this.computeImageStats();

    const hist = computeHistogram(this.floatBuffer);
    renderHistogram(hist);
    
    console.log("Float buffer synchronized with Fabric.js objects.");
  }

  private computeImageStats() {
    // Compute both mean and variance
    let mean = 0;
    for (let i = 0; i < this.floatBuffer.length; i++ ){
      mean += this.floatBuffer[i]!;
    }
    mean *= 255;
    mean /= this.floatBuffer.length;

    let variance = 0;
    for (let i = 0; i < this.floatBuffer.length; i++ ){
      variance += (this.floatBuffer[i]!*255 - mean)**2;
    }
    variance /= this.floatBuffer.length;

    this.mean = mean;
    this.variance = variance;
  }

  public resizeCanvas() {
    if (!this.autoResizeCanvas.value) return;
    const newWidth = window.innerWidth * 0.9;
    const newHeight = window.innerHeight * 0.9;

    this.setCanvasDimensions(newHeight,newWidth);
  }
  public setCanvasDimensions(newHeight:number, newWidth: number) {
    this.width.value = Math.floor(newWidth);
    this.height.value = Math.floor(newHeight);
    console.log(newWidth , newHeight);
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
    const objectType : string = (obj as unknown).customType;
    if (objectType == "rect") {
        this.rasterizeRect(obj);
    }
    else if (objectType == "circle") {
      this.rasterizeCircle(obj as Circle);
    }
    else if (objectType == "gaussian") {
      this.rasterizeGaussian(obj);
    }
    else if (objectType == "image") {
      this.rasterizeImage(obj as FabricImage);
    }
    else if (obj.type === 'path') {
      this.rasterizePath(obj as Path);
    }
    else if (objectType === 'sinusoidal') {
      this.rasterizeSinusoidal(obj);
    }
    else if (objectType === 'checkerboard'){
      this.rasterizeCheckerboard(obj);
    }
    else if (objectType === 'grid'){
      this.rasterizeGrid(obj);
    }
    else {
      console.warn("Object was not classified", obj)
    }

  }
  private rasterizeRect(obj : FabricObject) {
    const points = obj.getCoords();
    const p1 = points[0]!;
    const p2 = points[1]!;
    const p3  = points[2]!;
    const p4 = points[3]!;

    const minX = Math.max(0, Math.min(Math.floor(p1.x), Math.floor(p2.x),Math.floor(p3.x), Math.floor(p4.x)));
    const maxY = Math.min(this.height.value, Math.max(Math.floor(p1.y), Math.floor(p2.y),Math.floor(p3.y), Math.floor(p4.y)));
    const minY = Math.max(0, Math.min(Math.floor(p1.y), Math.floor(p2.y),Math.floor(p3.y), Math.floor(p4.y)));
    const maxX = Math.min(this.width.value, Math.max(Math.floor(p1.x), Math.floor(p2.x),Math.floor(p3.x), Math.floor(p4.x)));
    const color = getObjectGrayscale(obj) / 255.0;


    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        if (this.isPointInrect(x,y, p1,p2,p4)){
          const idx = y * this.width.value + x;
          this.floatBuffer[idx] = color;
        }
        
      }
    }
  }
  // We only need three points
  private isPointInrect(x : number,y : number ,a: Point,b : Point,c : Point) {
    const AM = [x - a.x, y - a.y];
    const AB = [b.x - a.x, b.y - a.y];
    const AC = [c.x - a.x, c.y - a.y];
    
    const dot_AM_AB = AM[0]! * AB[0]! + AM[1]! * AB[1]!;
    const dot_AB_AB = AB[0]! * AB[0]! + AB[1]! * AB[1]!;
    
    const dot_AM_AD = AM[0]! * AC[0]! + AM[1]! * AC[1]!;
    const dot_AD_AD = AC[0]! * AC[0]! + AC[1]! * AC[1]!;
    
    return (0 <= dot_AM_AB && dot_AM_AB <= dot_AB_AB) && (0 <= dot_AM_AD && dot_AM_AD<= dot_AD_AD)

  }
  private rasterizeCircle(obj : Circle) {

    const center = obj.getCenterPoint();
    const cx = center.x;
    const cy = center.y;
    const rx = obj.getRadiusX();
    const ry = obj.getRadiusY();

    const angle = degreesToRadians(obj.angle);

    const points = obj.getCoords();
    const p1 = points[0]!;
    const p2 = points[1]!;
    const p3  = points[2]!;
    const p4 = points[3]!;

    const minX = Math.max(0, Math.min(Math.floor(p1.x), Math.floor(p2.x),Math.floor(p3.x), Math.floor(p4.x)));
    const maxY = Math.min(this.height.value, Math.max(Math.floor(p1.y), Math.floor(p2.y),Math.floor(p3.y), Math.floor(p4.y)));
    const minY = Math.max(0, Math.min(Math.floor(p1.y), Math.floor(p2.y),Math.floor(p3.y), Math.floor(p4.y)));
    const maxX = Math.min(this.width.value, Math.max(Math.floor(p1.x), Math.floor(p2.x),Math.floor(p3.x), Math.floor(p4.x)));
    const color = getObjectGrayscale(obj) / 255.0;

    const rxSq = rx * rx;
    const rySq = ry * ry;
    for (let y = minY; y < maxY; y++) {

    for (let x = minX; x < maxX; x++) {
      const dy = (y + 0.5) - cy;
      const dx = (x + 0.5) - cx; 
      const dx_projection = dx* Math.cos(angle) + dy * Math.sin(angle);
      const dy_projection = -dx* Math.sin(angle) + dy * Math.cos(angle);
      
      const dySq = dy_projection * dy_projection;
      const dXSq = dx_projection * dx_projection;
      if ((dXSq / rxSq) + (dySq / rySq) <= 1.0) {
        const idx = y * this.width.value + x;
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
    const maxX = Math.min(this.width.value, Math.ceil(left + width));
    const minY = Math.max(0, Math.floor(top));
    const maxY = Math.min(this.height.value, Math.ceil(top + height));
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
          const dx = (x + 0.5) - centerX;
          const dy = (y + 0.5) - centerY;
          const distSq = dx * dx + dy * dy;

          const val = Math.exp(-distSq / (2 * (obj as unknown).sigma * (obj as unknown).sigma));
          const idx = y * this.width.value + x;

          this.floatBuffer[idx] = Math.min(1.0, val);
      }
    }
}
  private rasterizeSinusoidal(obj : FabricObject) {
    const width = (obj.width || 0) * (obj.scaleX || 1);
    const height = (obj.height || 0) * (obj.scaleY || 1);
    const left = obj.left!;
    const top = obj.top!;
    const cyclesX = (obj as unknown).cyclesX;
    const cyclesY = (obj as unknown).cyclesY;
    const freqX = (2 * Math.PI * cyclesX) / width;
    const freqY = (2 * Math.PI * cyclesY) / height;

    const minX = Math.max(0, Math.floor(left));
    const maxX = Math.min(this.width.value, Math.ceil(left + width));
    const minY = Math.max(0, Math.floor(top));
    const maxY = Math.min(this.height.value, Math.ceil(top + height));
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
          const localX = x - left;
          const localY = y - top;
          const val = Math.cos(localX * freqX) * Math.cos(localY * freqY); // [-1, 1]
          const val_corrected = (val + 1) / 2;
          const idx = y * this.width.value + x;

          this.floatBuffer[idx] = Math.min(1.0, val_corrected);
      }
    }
  }
  private rasterizeCheckerboard(obj : FabricObject) {
    const width = (obj.width || 0) * (obj.scaleX || 1);
    const height = (obj.height || 0) * (obj.scaleY || 1);
    const left = obj.left!;
    const top = obj.top!;
    const rows = (obj as unknown).rows;
    const columns = (obj as unknown).columns;
    const cellWidth = width / columns;
    const cellHeight = height / rows;

    const minX = Math.max(0, Math.floor(left));
    const maxX = Math.min(this.width.value, Math.ceil(left + width));
    const minY = Math.max(0, Math.floor(top));
    const maxY = Math.min(this.height.value, Math.ceil(top + height));
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
          const localX = x - left;
          const localY = y - top;
          
          const posX = (Math.floor(localX / cellWidth + 1/2) % 2) * 2 - 1 
          const posY = (Math.floor(localY / cellHeight + 1/2) % 2) * 2 - 1 

          const val = posX * posY;

          const idx = y * this.width.value + x;
          if (val == -1){
            this.floatBuffer[idx] = 0.0;
          }
          else{
            this.floatBuffer[idx] = 1.0;
          }
          
      }
    }
  }
  private rasterizeGrid(obj : FabricObject) {
    const width = (obj.width || 0) * (obj.scaleX || 1);
    const height = (obj.height || 0) * (obj.scaleY || 1);
    const left = obj.left!;
    const top = obj.top!;
    const rows = (obj as unknown).rows;
    const columns = (obj as unknown).columns;
    const cellWidth = Math.floor(width / columns);
    const cellHeight = Math.floor(height / rows);

    const minX = Math.max(0, Math.floor(left));
    const maxX = Math.min(this.width.value, Math.ceil(left + width));
    const minY = Math.max(0, Math.floor(top));
    const maxY = Math.min(this.height.value, Math.ceil(top + height));
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
          const localX = x - left;
          const localY = y - top;
          
          const idx = y * this.width.value + x;
          if (localX % cellWidth === Math.floor(cellWidth/2) || localY % cellHeight === Math.floor(cellHeight/2)){
            this.floatBuffer[idx] = 0.0;
          }
          else{
            this.floatBuffer[idx] = 1.0;
          }
      }
    }
  }
  private rasterizeImage(obj : FabricImage){
    const points = obj.getCoords();
    const p1 = points[0]!;
    const p2 = points[1]!;
    const p3  = points[2]!;
    const p4 = points[3]!;

    const minX = Math.max(0, Math.min(Math.floor(p1.x), Math.floor(p2.x),Math.floor(p3.x), Math.floor(p4.x)));
    const maxY = Math.min(this.height.value, Math.max(Math.floor(p1.y), Math.floor(p2.y),Math.floor(p3.y), Math.floor(p4.y)));
    const minY = Math.max(0, Math.min(Math.floor(p1.y), Math.floor(p2.y),Math.floor(p3.y), Math.floor(p4.y)));
    const maxX = Math.min(this.width.value, Math.max(Math.floor(p1.x), Math.floor(p2.x),Math.floor(p3.x), Math.floor(p4.x)));
    

    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;

    const offscreen = document.createElement('canvas');
    offscreen.width = this.width.value;
    offscreen.height = this.height.value;
    const offCtx = offscreen.getContext('2d')!;
    obj.render(offCtx);
    const imageData = offCtx.getImageData(minX, minY, cropWidth, cropHeight).data;

    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
          const localIdx = (y - minY) * (maxX - minX) + (x-minX);
          if (imageData[localIdx * 4 + 3] === 0) continue;
          const bufferIdx = y * this.width.value + x;
          this.floatBuffer[bufferIdx] = imageData[localIdx * 4]! / 255;
      }
    }
  }
  private rasterizePath(obj: Path) {
    const offscreen = document.createElement('canvas');
    offscreen.width = this.width.value;
    offscreen.height = this.height.value;

    const ctx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width.value, this.height.value);

    obj.render(ctx);

    const imgData = ctx.getImageData(0, 0, this.width.value, this.height.value);
    const data = imgData.data;

    const bound = obj.getBoundingRect();
    const minX = Math.max(0, Math.floor(bound.left));
    const maxX = Math.min(this.width.value, Math.ceil(bound.left + bound.width));
    const minY = Math.max(0, Math.floor(bound.top));
    const maxY = Math.min(this.height.value, Math.ceil(bound.top + bound.height));

    // Path color is stored in .stroke, not .fill, so create a temp object
    const objTemp = new FabricObject();
    objTemp.fill = obj.stroke;
    const color = getObjectGrayscale(objTemp);

    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        const pixelIdx = (y * this.width.value + x) * 4;
        const alpha = data[pixelIdx + 3];
        if (alpha == 0) continue;
        const bufferIdx = y * this.width.value + x;

        this.floatBuffer[bufferIdx] = color / 255;
      }
    }
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

const degreesToRadians = (angle : TDegree) => {
  return angle * (Math.PI / 180);

}