import { ref, type Ref, useTemplateRef } from 'vue';
import axios from 'axios';
import { Canvas, FabricImage } from 'fabric'

import { useImageBufferState } from '../composables/useImageBufferState.ts';

const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();

export const filterRequested : Ref<boolean> = ref(false);
export var filterImageSrc : Ref<string> = ref("test");

const SIMPLE_EDGE_DETECTION_URL = "http://localhost:8000/api/filter/edge/simple";
const SIMPLE_EDGE_DETECTION_MAX_VALUE_URL = "http://localhost:8000/api/filter/edge/simple/max_value"
const CANNY_EDGE_DETECTION_URL = "http://localhost:8000/api/filter/edge/canny"
const HIGHPASS_FILTER_URL = "http://localhost:8000/api/filter/highpass"
const LOWPASS_FILTER_URL = "http://localhost:8000/api/filter/lowpass"
const GAMMA_CORRECTION_URL = "http://localhost:8000/api/filter/gamma"

export async function getSimpleEdges() {
    const canvas = imageBuffer.value?.canvas;
    
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

        thresholdInput.max = Math.max(100,response.data.max_value).toString();
    }
    
    var thresholdObject : HTMLSelectElement | null = document.getElementById("simpleEdgeThreshold") as HTMLSelectElement;
    var threshold = 0;
    if (thresholdObject) {
        threshold = Number(thresholdObject.value);
    }

    var applyGaussianObject : HTMLInputElement | null = document.getElementById("applyGaussianSimpleEdges") as HTMLInputElement;
    var applyGaussian = true;
    if (applyGaussianObject) {
        applyGaussian = Boolean(applyGaussianObject.checked);
    }

    try {

        const response = await axios.post(SIMPLE_EDGE_DETECTION_URL, grayArray, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'x-image-width': width.toString(),
            'x-image-height': height.toString(),
            'threshold': threshold,
            'applyGaussian': applyGaussian.toString(),
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

export async function getCannys() {
    const canvas = imageBuffer.value?.canvas;
    
    if (!canvas) return;
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
    const rgba = imageData.data;

    const totalPixels = width * height;
    const grayArray  : Uint8Array<any> = new Uint8Array(totalPixels);

    for (let i = 0; i < totalPixels; i++) {
        grayArray[i] = rgba[i * 4]!;
    }

    // Get thresholds and gaussian checkbox
    var thresholdWeakObject : HTMLSelectElement | null = document.getElementById("thresholdCannyWeak") as HTMLSelectElement;
    var thresholdWeak = 0;
    if (thresholdWeakObject) {
        thresholdWeak = Number(thresholdWeakObject.value);
    }
    var thresholdStrongObject : HTMLSelectElement | null = document.getElementById("thresholdCannyStrong") as HTMLSelectElement;
    var thresholdStrong = 0;
    if (thresholdStrongObject) {
        thresholdStrong = Number(thresholdStrongObject.value);
    }
    var applyGaussianObject : HTMLInputElement | null = document.getElementById("applyGaussianCanny") as HTMLInputElement;
    var applyGaussian = true;
    if (applyGaussianObject) {
        applyGaussian = Boolean(applyGaussianObject.checked);
    }

    try {

        const response = await axios.post(CANNY_EDGE_DETECTION_URL, grayArray, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'x-image-width': width.toString(),
            'x-image-height': height.toString(),
            'thresholdWeak': thresholdWeak,
            'thresholdStrong': thresholdStrong,
            'applyGaussian': applyGaussian,
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
    
    filterRequested.value = true;
    changeFilterType("cannys_edge")
}

export async function getHighpassFilter() {
    const canvas = imageBuffer.value?.canvas;
    
    if (!canvas) return;
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
    const rgba = imageData.data;

    const totalPixels = width * height;
    const grayArray  : Uint8Array<any> = new Uint8Array(totalPixels);

    for (let i = 0; i < totalPixels; i++) {
        grayArray[i] = rgba[i * 4]!;
    }

    // Get thresholds and gaussian checkbox
    var sigmaObject : HTMLSelectElement | null = document.getElementById("highpassFilterSigma") as HTMLSelectElement;
    var sigma = 0;
    if (sigmaObject) {
        sigma = Number(sigmaObject.value);
    }

    try {

        const response = await axios.post(HIGHPASS_FILTER_URL, grayArray, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'x-image-width': width.toString(),
            'x-image-height': height.toString(),
            'sigma': sigma,
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
    
    filterRequested.value = true;
    changeFilterType("highpass")
}

export async function getLowpassFilter() {
    const canvas = imageBuffer.value?.canvas;
    
    if (!canvas) return;
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
    const rgba = imageData.data;

    const totalPixels = width * height;
    const grayArray  : Uint8Array<any> = new Uint8Array(totalPixels);

    for (let i = 0; i < totalPixels; i++) {
        grayArray[i] = rgba[i * 4]!;
    }

    // Get thresholds and gaussian checkbox
    var sigmaObject : HTMLSelectElement | null = document.getElementById("lowpassFilterSigma") as HTMLSelectElement;
    var sigma = 0;
    if (sigmaObject) {
        sigma = Number(sigmaObject.value);
    }

    try {

        const response = await axios.post(LOWPASS_FILTER_URL, grayArray, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'x-image-width': width.toString(),
            'x-image-height': height.toString(),
            'sigma': sigma,
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
    
    filterRequested.value = true;
    changeFilterType("lowpass")
}

export async function getGammaCorrection() {
    const canvas = imageBuffer.value?.canvas;
    
    if (!canvas) return;
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
    const rgba = imageData.data;

    const totalPixels = width * height;
    const grayArray  : Uint8Array<any> = new Uint8Array(totalPixels);

    for (let i = 0; i < totalPixels; i++) {
        grayArray[i] = rgba[i * 4]!;
    }

    // Get thresholds and gaussian checkbox
    var gammaObject : HTMLSelectElement | null = document.getElementById("gammaCorrectionValue") as HTMLSelectElement;
    var gamma = 0;
    if (gammaObject) {
        gamma = Number(gammaObject.value);
    }

    try {

        const response = await axios.post(GAMMA_CORRECTION_URL, grayArray, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'x-image-width': width.toString(),
            'x-image-height': height.toString(),
            'gamma': gamma,
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
    
    filterRequested.value = true;
    changeFilterType("gammaCorrection")
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