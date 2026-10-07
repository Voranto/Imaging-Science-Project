import { ref, type Ref } from 'vue';
import axios, {type AxiosResponse, AxiosHeaders} from 'axios';
import { FabricImage, FabricObject } from 'fabric'
import { useImageBufferState } from '../useImageBufferState.ts';
import { transformImageSrc, getTransformType, changeTransformType, transformRequested  } from './useTransforms.ts';
import { clearCanvas } from '../canvas.ts';

const { imageBuffer } = useImageBufferState();
let canvas = imageBuffer.value?.canvas;

export const imageID = ref("");

export abstract class  Transform {
    abstract baseURL : string;
    abstract transformType : TransformType;
    static isLoading : Ref<boolean> = ref(false);
    static abortController: AbortController | null = null;
    activeObject : FabricObject | undefined;

    public async applyTransform() : Promise<void> {
        this.initializeCanvas();
        if (!canvas) return;

        await this.storeActiveObject();

        // Round the height and weight to prevent issues when sending it through axios
        const width = Math.floor(canvas.width);
        const height = Math.floor(canvas.height);

        // Set the transform type in TransformRender to its appropiate type
        changeTransformType(this.transformType.toString());

        const grayArray = this.getGrayscaleArray();
            

        await this.requestTransform(height, width, grayArray);

        this.retrieveActiveObject();
    }

    public async applyInverse() : Promise<void> {
        try {
            const response = await axios.post<Blob>(this.baseURL + "/inverse/grayscale", {},{
            params: { image_id: imageID.value },
            responseType: 'blob',
            });
            this.hideTransformContainer();

            await this.projectResultOnMainCanvas(response);
        } catch (error) {
            console.error('Inverse computation failed:', error);
        }
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

    private getGrayscaleArray() : Float32Array<ArrayBufferLike>{
        const arr = imageBuffer.value?.floatBuffer;
        if (!arr) return new Float32Array();
        return arr;
    }

    private async requestTransform(height: number, width: number, grayArray : Float32Array<ArrayBufferLike>) {
        Transform.isLoading.value = true; 
        this.visibilizeTransformContainer();
            if (Transform.abortController) {
            Transform.abortController.abort();
        }
        Transform.abortController = new AbortController();
        try {
            
            const response = await axios.post(this.baseURL + "/grayscale", grayArray, {
            headers: this.getHeaders(height, width),
            responseType: 'blob',
            signal: Transform.abortController.signal,
            });
            const id = response.headers['x-image-id'];
            if (!id) {
                console.error("Transform did not return an imageID");
            }
            imageID.value = id;

            
            
            await this.renderImageResult(response);
            
        } catch (error) {
            console.error('Upload failed:', error);
        }
        finally{
            Transform.isLoading.value = false;
            Transform.abortController = null;
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

    private async projectResultOnMainCanvas(response: AxiosResponse<Blob>) {
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
                imageBuffer.value.syncFloatBuffer();
            }
            URL.revokeObjectURL(newImageUrl);
    }

    public async renderTransformToCanvas() {
        if (getTransformType() === "none") return;
        const height = imageBuffer.value?.height;
        const width = imageBuffer.value?.width;
        if (!height || !width) return;
        const imgURL = this.getImageSrc();
        const imgCopy = new Image();
        imgCopy.src = imgURL;
        imgCopy.onload = async () => {

            const image = new FabricImage(imgCopy);
            image.set({ 
                originX: 'left',
                originY: 'top',
            })
            image.set("customType", "image")
            clearCanvas()
            imageBuffer.value?.canvas.add(image);
            imageBuffer.value?.canvas.setActiveObject(image);

            imageBuffer.value?.syncFloatBuffer();
        };
        this.hideTransformContainer();
    }

    protected async renderImageResult(response: AxiosResponse<Blob>) {
        const newImageUrl = URL.createObjectURL(response.data);
        transformImageSrc.value = newImageUrl
    }

    private async visibilizeTransformContainer() {
        transformRequested.value = true;
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    private async hideTransformContainer() {
        transformRequested.value = false;
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    private getImageSrc() {
        const imageElement = document.getElementById("transformImage") as HTMLImageElement;
        return imageElement.src;
    }
    public static abortRequest() {
        Transform.abortController?.abort();
    }
    public abstract getParameters() : Array<[string, string]>;
}
export enum TransformType {
    fft = "fft",
    dwt = "dwt",
    dct = "dct"
}

