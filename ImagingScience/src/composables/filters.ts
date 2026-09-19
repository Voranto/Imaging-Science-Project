import { ref, type Ref, useTemplateRef } from 'vue';
import axios from 'axios';
import { useCanvasState } from './useCanvas.js'
import { Canvas, FabricImage } from 'fabric'

const { canvasInstance } = useCanvasState();

export const filterRequested : Ref<boolean> = ref(false);
export var filterImageSrc : Ref<string> = ref("test");

const SIMPLE_EDGE_DETECTION_URL = "http://localhost:8000/api/filter/edge/simple";
const SIMPLE_EDGE_DETECTION_MAX_VALUE_URL = "http://localhost:8000/api/filter/edge/simple/max_value"

export async function getSimpleEdges() {
    const canvas = canvasInstance.value;
    
    if (!canvas) return;
    
    
    filterRequested.value = true;
    changeFilterType("simple_edge")

    // We have to deselect any objects, otherwise the Edge Detection will be wrong because of the bounding box
    // Preserve the activeObject for afterwards
    var activeObject = canvas.getActiveObject();
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Round the height and weight to prevent issues when sending it through axios
    const width = Math.floor(canvas.width);
    const height = Math.floor(canvas.height);


    const ctx = canvas.getContext()
    const imageData = ctx.getImageData(0, 0, width, height);
    console.log(width,height);
    const rgba = imageData.data;

    const totalPixels = width * height;
    const grayArray  : Uint8Array<any> = new Uint8Array(totalPixels);

    for (let i = 0; i < totalPixels; i++) {
        grayArray[i] = rgba[i * 4]!;
    }

    // Update max value of the threshold
    const thresholdInput : HTMLInputElement| null = document.getElementById("simpleEdgeThreshold") as HTMLInputElement;
    if (thresholdInput) {
        const response = await axios.post(SIMPLE_EDGE_DETECTION_MAX_VALUE_URL, grayArray, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'x-image-width': width.toString(),
            'x-image-height': height.toString(),
        },
        });

        thresholdInput.max = response.data.max_value.toString();
    }
    
    var thresholdObject : HTMLSelectElement | null = document.getElementById("simpleEdgeThreshold") as HTMLSelectElement;
    var threshold = 0;
    if (thresholdObject) {
        threshold = Number(thresholdObject.value);
    }


    try {

        const response = await axios.post(SIMPLE_EDGE_DETECTION_URL, grayArray, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'x-image-width': width.toString(),
            'x-image-height': height.toString(),
            'threshold': threshold,
        },
        responseType: 'blob',
        });

        
        const newImageUrl = URL.createObjectURL(response.data);
        filterImageSrc.value = newImageUrl;
        
    } catch (error) {
        console.error('Upload failed:', error);
    }

    if (activeObject){
        canvas.setActiveObject(activeObject);
        canvas.requestRenderAll();
    }
}


export function getFilterType() {
    const filterType : HTMLSelectElement | null = document.getElementById("filterType") as HTMLSelectElement;
    if (filterType) {
        return filterType.value;
    }
    return null;
}

function changeFilterType(mode: string) {
    const filterType : HTMLSelectElement | null = document.getElementById("filterType") as HTMLSelectElement;
    if (filterType) {
        filterType.value = mode;
    }
}