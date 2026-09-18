import { ref, type Ref, useTemplateRef } from 'vue';
import axios from 'axios';
import { useCanvasState } from './useCanvas.js'
import { Canvas, FabricImage } from 'fabric'

const { canvasInstance } = useCanvasState();

export const transformRequested : Ref<boolean> = ref(false);
export const transformCanvas = ref<Canvas | null>(null);

const FFT_COMPUTE_URL = "http://localhost:8000/api/fft/grayscale";
export async function getFFT() {
    

    const canvas = canvasInstance.value;
    
    if (!canvas) return;
    
    // We have to deselect any objects, otherwise the FFT will be wrong because of the bounding box
    // Preserve the activeObject for afterwards
    var activeObject = canvas.getActiveObject();
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    await new Promise((resolve) => requestAnimationFrame(resolve));


    // Round the height and weight to prevent issues when sending it through axios
    const width = Math.floor(canvas.width);
    const height = Math.floor(canvas.height);

    // Set the transform type in TransformRender to fft
    changeTransformType("fft");

    const ctx = canvas.getContext()
    const imageData = ctx.getImageData(0, 0, width, height);
    console.log(width,height);
    const rgba = imageData.data;

    const totalPixels = width * height;
    const grayArray  : Uint8Array<any> = new Uint8Array(totalPixels);

    for (let i = 0; i < totalPixels; i++) {
        grayArray[i] = rgba[i * 4]!;
    }

    try {

        const response = await axios.post(FFT_COMPUTE_URL, grayArray, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'x-image-width': width.toString(),
            'x-image-height': height.toString(),
        },
        responseType: 'blob',
        });

        // First reveal the canvas container
        transformRequested.value = true;
        await new Promise((resolve) => requestAnimationFrame(resolve));

        // Initiate the canvas only once
        if (!transformCanvas.value) {
            console.log("here")
            const el = document.getElementById('transformImageCanvas') as HTMLCanvasElement | null;
            if (el) {
                transformCanvas.value = new Canvas(el);
            }
        }

        
        const newImageUrl = URL.createObjectURL(response.data);
        console.log(transformCanvas)
        if (transformCanvas && transformCanvas.value){
            const tCanvas = transformCanvas.value;
            console.log(tCanvas)
            tCanvas.setDimensions({
                width: canvas.width,
                height: canvas.height
            })
            tCanvas.clear();
            tCanvas.backgroundColor = "white";

            const img = await FabricImage.fromURL(newImageUrl);
            img.set({
                selectable: false,
                evented: false,
                width: canvas.width,
                height: canvas.height,
                left: canvas.width / 2,
                top: canvas.height / 2
            });

            tCanvas.add(img);
            tCanvas.requestRenderAll();
        }

        
    } catch (error) {
        console.error('Upload failed:', error);
    }
    if (activeObject){
        canvas.setActiveObject(activeObject);
        canvas.requestRenderAll();
    }
    
}

// Check if the FFT has been updated from the canvas, and if so, do the ifft2 and redraw
async function updateImageFFT() {

}

export function updateImageTransform() {
    const transformType = getTransformType();
    if (transformType == "fft") {
        updateImageFFT();
    }

    changeTransformType("none")
    transformRequested.value =false; 
}

function getTransformType() {
    const transformType : HTMLSelectElement | null = document.getElementById("transformType") as HTMLSelectElement;
    if (transformType) {
        return transformType.value;
    }
    return null;
}

function changeTransformType(mode: string) {
    const transformType : HTMLSelectElement | null = document.getElementById("transformType") as HTMLSelectElement;
    if (transformType) {
        transformType.value = mode;
    }
}