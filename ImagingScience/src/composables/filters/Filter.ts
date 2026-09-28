import { ref, type Ref, useTemplateRef } from 'vue';
import axios, {type AxiosResponse, AxiosHeaders} from 'axios';
import { Canvas, FabricImage, FabricObject } from 'fabric'
import { useImageBufferState } from '../useImageBufferState.ts';
import { filterImageSrc, filterRequested, getFilterType, changeFilterType  } from './useFilter.ts';

const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();
var canvas = imageBuffer.value?.canvas;

export var imageID = ref("");

export abstract class  Filter {
    abstract baseURL : string;
    abstract filterType : FilterType;
    static isLoading : Ref<boolean> = ref(false);
    static abortController: AbortController | null = null;
    activeObject : FabricObject | undefined;

    public async applyFilter() : Promise<void> {
        this.initializeCanvas();
        if (!canvas) return;

        await this.storeActiveObject();

        // Round the height and weight to prevent issues when sending it through axios
        const width = Math.floor(canvas.width);
        const height = Math.floor(canvas.height);

        // Set the transform type in TransformRender to its appropiate type
        changeFilterType(this.filterType.toString());

        const grayArray = this.getGrayscaleArray();
        
        await this.requestFilter(height, width, grayArray);

        this.retrieveActiveObject();
    }

    public static abortRequest() {
        Filter.abortController?.abort();
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

    private getGrayscaleArray() : Float32Array<any>{
        const arr = imageBuffer.value?.floatBuffer;
        if (!arr) return new Float32Array();
        return arr;
    }

    private async requestFilter(height: number, width: number, grayArray : Float32Array<any>) {
        Filter.isLoading.value = true;

        if (Filter.abortController) {
            Filter.abortController.abort();
        }
        Filter.abortController = new AbortController();

        try {
            
            const response = await axios.post(this.baseURL, grayArray, {
            headers: this.getHeaders(height, width),
            responseType: 'blob',
            signal: Filter.abortController.signal,
            });

            this.visibilizeFilterContainer();
            
            await this.renderImageResult(response);
            
        } catch (error) {
            console.error('Upload failed:', error);
        }
        finally{
            Filter.isLoading.value = false;
            Filter.abortController = null;
        }
        
    }

    private getHeaders(height :number, width: number) {
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

    private async renderImageResult(response: AxiosResponse<any, Float32Array>) {
        const newImageUrl = URL.createObjectURL(response.data);
        filterImageSrc.value = newImageUrl
    }

    private async visibilizeFilterContainer() {
        filterRequested.value = true;
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    private async hideFilterContainer() {
        filterRequested.value = false;
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    public async renderFilterToCanvas() {
        if (getFilterType() === "none") return;
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

            // TODO: Make the decision if clearing the canvas is worth it
            imageBuffer.value!.canvas.clear();
            imageBuffer.value!.canvas.backgroundColor = "white";

            imageBuffer.value?.canvas.add(image);
            imageBuffer.value?.canvas.setActiveObject(image);

            imageBuffer.value?.syncFloatBuffer();
        };
        this.hideFilterContainer();
    }
    private getImageSrc() {
        const imageElement = document.getElementById("transformImage") as HTMLImageElement;
        return imageElement.src;
    }

    public abstract getParameters() : Array<[string, string]>;
}
export enum FilterType {
    simpleEdge = "simpleEdge",
    cannys = "cannys",
    highpass = "highpass",
    lowpass = "lowpass",
    gammaCorrection = "gammaCorrection",
    cornerTomasi = "cornerTomasi",
    cornerRohr = "cornerRohr",
    cornerHarris = "cornerHarris",
    dilation = "dilation",
    erosion = "erosion",
    opening = "opening",
    closing = "closing",
    whiteTopHat = "whiteTopHat",
    blackTopHat  = "blackTopHat",
    selfdualTopHat = "selfdualTopHat",
    median = "median",
    waveletShrinkage = "waveletShrinkage",
    bilateral = "bilateral",
    NLMeans = "NLMeans",
    diffusion = "diffusion",
}
