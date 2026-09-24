import { ref, type Ref } from 'vue';
import axios from 'axios';
import { Canvas, FabricImage } from 'fabric'
import { FFT } from './FFT.ts'
import { DCT } from './DCT.ts'
import { DWT } from './DWT.ts'
import { useImageBufferState } from '../composables/useImageBufferState.ts';

const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();

export const transformRequested : Ref<boolean> = ref(false);
export const transformCanvas = ref<Canvas | null>(null);

const instanceFFT = new FFT();
const instanceDCT = new DCT();
const instanceDWT = new DWT();


export async function getFFT() {
    instanceFFT.applyTransform();
}
export async function getIFFT() {
    instanceFFT.applyInverse();
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

export function getTransformType() {
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