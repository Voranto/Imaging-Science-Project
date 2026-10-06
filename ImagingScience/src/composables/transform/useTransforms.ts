import { ref, type Ref } from 'vue';
import axios from 'axios';
import { Canvas, FabricImage } from 'fabric'
import { FFT } from './FFT.ts'
import { DCT } from './DCT.ts'
import { DWT } from './DWT.ts'
import { useImageBufferState } from '../useImageBufferState.ts';
import { TransformType } from './transform.ts';

const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();

export const transformRequested : Ref<boolean> = ref(false);
export let transformImageSrc : Ref<string> = ref("");

const instanceFFT = new FFT();
const instanceDCT = new DCT();
const instanceDWT = new DWT();


export async function getFFT() {
    instanceFFT.applyTransform();
}
export async function getIFFT() {
    instanceFFT.applyInverse();
}

export async function getIDCT(){
    instanceDCT.applyInverse();
}

export async function getDCT() {
    instanceDCT.applyTransform();
}

export async function getDWT() {
    instanceDWT.applyTransform();
}

export function updateImageTransform() {
    changeTransformType("none")
    transformRequested.value =false; 
}

export function renderTransformToCanvas() {
    const transformType = getTransformType();
    console.log(transformType);
    if (transformType == TransformType.fft) {
        instanceFFT.renderTransformToCanvas();
    }
    else if (transformType == TransformType.dct) {
        instanceDCT.renderTransformToCanvas();
    }
    else if (transformType == TransformType.dwt) {
        instanceDWT.renderTransformToCanvas();
    }
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
export function applyFrequencyFilterFFT() {
    const cutoffType : HTMLSelectElement | null = document.getElementById("frequencyFilterOption") as HTMLSelectElement;
    let type = 0;
    if (cutoffType) {
        type = Number(cutoffType.value);
    }
    const highObj : HTMLSelectElement | null = document.getElementById("highestFrequency") as HTMLSelectElement;
    let high = 0;
    if (highObj) {
        high = Number(highObj.value);
    }
    const lowObj : HTMLSelectElement | null = document.getElementById("lowestFrequency") as HTMLSelectElement;
    let low = 0;
    if (lowObj) {
        low = Number(lowObj.value);
    }

    instanceFFT.applyFrequencyFilter(low, high, type);
}