import { ref, type Ref } from 'vue';
import axios from 'axios';
import { Canvas, FabricImage } from 'fabric'
import { useImageBufferState } from '../useImageBufferState.ts';
import {Cannys} from "./Cannys.ts"
import { Highpass } from './Highpass.ts';
import { Lowpass } from './Lowpass.ts';
import { SimpleEdges } from './SimpleEdges.ts';
import { GammaCorrection } from './GammaCorrection.ts';

const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();

export const filterRequested : Ref<boolean> = ref(false);
export var filterImageSrc : Ref<string> = ref("");

const cannyInstance = new Cannys();
const highpassInstance = new Highpass();
const lowpassInstance = new Lowpass();
const simpleEdgeInstance = new SimpleEdges();
const gammaCorrectionInstance = new GammaCorrection();

export function getSimpleEdges() {
    simpleEdgeInstance.applyFilter();
    console.log(getFilterType());
}
export function getCannys() {
    cannyInstance.applyFilter();
}
export function getHighpassFilter(){
    highpassInstance.applyFilter();
}
export function getLowpassFilter() {
    lowpassInstance.applyFilter();
}
export function getGammaCorrection() {
    gammaCorrectionInstance.applyFilter();
}

export function updateImageTransform() {
    changeFilterType("none")
    filterRequested.value =false; 
}

export function renderTransformToCanvas() {

}

export function getFilterType() {
    const filterType : HTMLSelectElement | null = document.getElementById("filterType") as HTMLSelectElement;
    if (filterType) {
        return filterType.value;
    }
    return null;
}

export function changeFilterType(mode: string) {
    console.log("here", mode);
    const filterType : HTMLSelectElement | null = document.getElementById("filterType") as HTMLSelectElement;
    if (filterType) {
        filterType.value = mode;
    }
}