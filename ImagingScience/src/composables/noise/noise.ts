import { ref, type Ref } from 'vue';
import axios, {type AxiosResponse, AxiosHeaders} from 'axios';
import { Canvas, FabricImage } from 'fabric'
import { useImageBufferState } from '../useImageBufferState.ts';
import { clearCanvas } from '../canvas.ts';

const { imageBuffer } = useImageBufferState();
let canvas = imageBuffer.value?.canvas;

export const transformRequested : Ref<boolean> = ref(false);
export const transformCanvas = ref<Canvas | null>(null);
export const imageID = ref("");

export abstract class  Noise {
    abstract baseURL : string;
    abstract noiseType : NoiseType;

    public async applyNoise() : Promise<void> {
        this.initializeCanvas();
        if (!canvas) return;


        // Round the height and weight to prevent issues when sending it through axios
        const width = Math.floor(canvas.width);
        const height = Math.floor(canvas.height);

        const grayArray = this.getGrayscaleArray();

        await this.requestNoise(height, width, grayArray);

    }

    private getGrayscaleArray() : Float32Array<ArrayBufferLike>{
        const arr = imageBuffer.value?.floatBuffer;
        if (!arr) return new Float32Array();
        return arr;
    }

    private async requestNoise(height: number, width: number, grayArray : Float32Array<ArrayBufferLike>) {
         try {
            
            const response = await axios.post(this.baseURL, grayArray, {
            headers: this.getHeaders(height, width),
            responseType: 'blob',
            });
            await this.projectResultOnCanvas(response);
            
        } catch (error) {
            console.error('Upload failed:', error);
        }

    }

    private getHeaders(height :number, width: number) {
        const headers = new AxiosHeaders({
                'Content-Type': 'application/octet-stream',
                'x-image-width': Math.floor(width).toString(),
                'x-image-height': Math.floor(height).toString(),
            });
        const parameters = this.getParameters();
        for (const [key ,value ] of parameters) {
            headers.set(key,value)
        }

        return headers;
    }

    private initializeCanvas() {
        canvas = imageBuffer.value?.canvas;
    }

    private async projectResultOnCanvas(response: AxiosResponse<Blob>) {
        const newImageUrl = URL.createObjectURL(response.data);

            if (imageBuffer && imageBuffer.value){
                const canvas = imageBuffer.value.canvas;

                const img = await FabricImage.fromURL(newImageUrl);
                img.set({
                    customType: "image",
                    width: canvas!.width,
                    height: canvas!.height,
                    
                    left: 0,
                    top: 0
                });
                img.set("originX", "top");
                img.set("originY", "left");
                clearCanvas()
                canvas.add(img);
                canvas.requestRenderAll();
                await new Promise((resolve) => requestAnimationFrame(resolve));
                imageBuffer.value.syncFloatBuffer();
            }
            URL.revokeObjectURL(newImageUrl);
    }
    public abstract getParameters() : [string, string][];
}
export enum NoiseType {
    additive = "additive",
    gaussian = "gaussian",
    multiplicative_uniform = "multiplicative_uniform",
    multiplicative_gaussian = "multiplicative_gaussian",
    impulse = "impulse"
}