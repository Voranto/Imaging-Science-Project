import { ref, type Ref, useTemplateRef } from 'vue';
import axios, {type AxiosResponse, AxiosHeaders} from 'axios';
import { Canvas, FabricImage, FabricObject } from 'fabric'
import { useImageBufferState } from '../composables/useImageBufferState.ts';

const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();
var canvas = imageBuffer.value?.canvas;

export const transformRequested : Ref<boolean> = ref(false);
export const transformCanvas = ref<Canvas | null>(null);

export abstract class  Transform {
    abstract baseURL : string;
    abstract transformType : TransformType;
    activeObject : FabricObject | undefined;

    public async applyTransform() : Promise<void> {
        this.initializeCanvas();
        if (!canvas) return;

        await this.storeActiveObject();


        // Round the height and weight to prevent issues when sending it through axios
        const width = Math.floor(canvas.width);
        const height = Math.floor(canvas.height);

        // Set the transform type in TransformRender to DWT
        changeTransformType(this.transformType.toString());

        const grayArray = this.getGrayscaleArray(height, width);
            

        await this.requestTransform(height, width, grayArray);

        this.retrieveActiveObject();
    }

    private async storeActiveObject() {
        if(!canvas) return;

        this.activeObject = canvas.getActiveObject();
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    private retrieveActiveObject() {
        if(!canvas) return;

        if (this.activeObject){
            canvas.setActiveObject(this.activeObject);
            canvas.requestRenderAll();
        }
    }

    private getGrayscaleArray(height: number, width: number) : Float32Array<any>{
        imageBuffer.value?.resizeCanvas();
        const arr = imageBuffer.value?.floatBuffer;
        if (!arr) return new Float32Array();
        return arr;
    }

    private async requestTransform(height: number, width: number, grayArray : Float32Array<any>) {
         try {
            
            const response = await axios.post(this.baseURL + "/grayscale", grayArray, {
            headers: this.getHeaders(height, width),
            responseType: 'blob',
            });
            

            this.visibilizeTransformContainer();

            this.initializeTransformCanvas();

            
            await this.projectResultOnCanvas(response);
            
        } catch (error) {
            console.error('Upload failed:', error);
        }

    }

    private getHeaders(height :number, width: number) {
        console.log("Headers,", Math.floor(width), Math.floor(height))
        var headers = new AxiosHeaders({
                'Content-Type': 'application/octet-stream',
                'x-image-width': Math.floor(width).toString(),
                'x-image-height': Math.floor(height).toString(),
            });
        var parameters = this.getParameters();
        for (const [key ,value ] of parameters) {
            headers.set(key,value)
        }

        return headers;
    }

    private initializeCanvas() {
        canvas = imageBuffer.value?.canvas;
    }

    private initializeTransformCanvas() {
        // Initiate the canvas only once
        if (!transformCanvas.value) {
            const el = document.getElementById('transformImageCanvas') as HTMLCanvasElement | null;
            if (el) {
                transformCanvas.value = new Canvas(el);
            }
        }
    }

    private async projectResultOnCanvas(response: AxiosResponse<any, Float32Array>) {
        const newImageUrl = URL.createObjectURL(response.data);

            if (transformCanvas && transformCanvas.value){
                const tCanvas = transformCanvas.value;
                tCanvas.setDimensions({
                    width: canvas!.width,
                    height: canvas!.height
                })
                tCanvas.clear();
                tCanvas.backgroundColor = "white";

                const img = await FabricImage.fromURL(newImageUrl);
                img.set({
                    selectable: false,
                    evented: false,
                    width: canvas!.width,
                    height: canvas!.height,
                    left: canvas!.width / 2,
                    top: canvas!.height / 2
                });

                tCanvas.add(img);
                tCanvas.requestRenderAll();
            }
            URL.revokeObjectURL(newImageUrl);
    }

    private async visibilizeTransformContainer() {
        transformRequested.value = true;
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    public abstract getParameters() : Array<[string, string]>;
}
export enum TransformType {
    fft = "fft",
    dwt = "dwt",
    dct = "dct"
}
export function updateImageTransform() {
        changeTransformType("none")
        transformRequested.value =false; 
    }
    
export function getTransformType() {
    const transformType : HTMLSelectElement | null = document.getElementById("transformType") as HTMLSelectElement;
    if (transformType) {
        return transformType.value;
    }
    return null;
}

export function changeTransformType(mode: string) {
    const transformType : HTMLSelectElement | null = document.getElementById("transformType") as HTMLSelectElement;
    if (transformType) {
        transformType.value = mode;
    }
}

export function renderTransformToCanvas() {
    if (getTransformType() === "none") return;
    const height = imageBuffer.value?.height;
    const width = imageBuffer.value?.width;
    if (!height || !width) return;
    if (!transformCanvas.value) return;

    const imgCopy = new Image();
    imgCopy.src = transformCanvas.value.toDataURL({ format: 'png', multiplier: 1 });
    imgCopy.onload = () => {

        const image = new FabricImage(imgCopy);
        image.set({ 
            originX: 'left',
            originY: 'top',
        })
        image.set("customType", "image")

        imageBuffer.value?.canvas.add(image);
        imageBuffer.value?.canvas.setActiveObject(image);
        imageBuffer.value?.syncFloatBuffer();
    };
}