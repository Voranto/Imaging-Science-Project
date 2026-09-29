import { ref, type Ref } from 'vue';
import axios from 'axios';
import { Canvas, FabricImage } from 'fabric'
import { useImageBufferState } from '../useImageBufferState.ts';
import {Cannys} from "./Cannys.ts"
import { Highpass } from './Highpass.ts';
import { Lowpass } from './Lowpass.ts';
import { SimpleEdges } from './SimpleEdges.ts';
import { GammaCorrection } from './GammaCorrection.ts';
import { Corner } from './Corner.ts';
import { Morphological } from './Morphological.ts';
import { Median } from './Median.ts';
import { WaveletShrinkage } from './WaveletShrinkage.ts';
import { Bilateral } from './Bilateral.ts';
import { NLMeans } from './NLMeans.ts';
import { Diffusion } from './Diffusion.ts';
import { AffineGrayscale } from './AffineGrayscale.ts';
import { Filter } from './Filter.ts';
const { imageBuffer, setImageBuffer, destroyImageBuffer } = useImageBufferState();

export const filterRequested : Ref<boolean> = ref(false);
export var filterImageSrc : Ref<string> = ref("");

const cannyInstance = new Cannys();
const highpassInstance = new Highpass();
const lowpassInstance = new Lowpass();
const simpleEdgeInstance = new SimpleEdges();
const gammaCorrectionInstance = new GammaCorrection();

const cornerTomasiInstance = new Corner("first","tomasi");
const cornerRohrInstance = new Corner("first", "rohr")
const cornerHarrisInstance = new Corner("first", "harris")

const dilationInstance = new Morphological("dilation");
const erosionInstance = new Morphological("erosion");
const openingInstance = new Morphological("opening");
const closingInstance = new Morphological("closing");
const whiteTopHatInstance = new Morphological("whiteTopHat");
const blackTopHatInstance = new Morphological("blackTopHat");
const selfdualTopHatInstance = new Morphological("selfdualTopHat");
const medianInstance = new Median();
const waveletShrinkage = new WaveletShrinkage();
const bilateralInstance = new Bilateral();
const NLMeansInstance = new NLMeans();
const diffusionInstance = new Diffusion();
const affineGrayscale = new AffineGrayscale();

export function updateImageTransform() {
    changeFilterType("none")
    filterRequested.value =false; 
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
export function getFilterInstance(type : string) {
    if (type === 'simpleEdge') return simpleEdgeInstance;
    if (type === 'cannys') return cannyInstance;
    if (type === 'highpass') return highpassInstance;
    if (type === 'lowpass') return lowpassInstance;
    if (type === 'gamma') return gammaCorrectionInstance;
    if (type === 'cornerTomasi') return cornerTomasiInstance;
    if (type === 'cornerRohr') return cornerRohrInstance;
    if (type === 'cornerHarris') return cornerHarrisInstance;
    if (type === 'erosion') return erosionInstance;
    if (type === 'dilation') return dilationInstance;
    if (type === 'opening') return openingInstance;
    if (type === 'closing') return closingInstance;
    if (type === 'whiteTopHat') return whiteTopHatInstance;
    if (type === 'blackTopHat') return blackTopHatInstance;
    if (type === 'selfdualTopHat') return selfdualTopHatInstance;
    if (type === 'median') return medianInstance;
    if (type === "waveletShrinkage") return waveletShrinkage;
    if (type === "bilateral") return bilateralInstance;
    if (type === "NLMeans") return NLMeansInstance;
    if (type === "diffusion") return diffusionInstance;
    if (type === "affineGrayscale") return affineGrayscale;
    return null;
}
export const handleFilter = (type: string) => {
    const instance = getFilterInstance(type);
    instance?.applyFilter();
};

export const renderFilterToCanvas = () => {
    const type = getFilterType();
    if (!type) return;
    const instance = getFilterInstance(type);
    instance?.renderFilterToCanvas()
}

export function updateCurrentFilter() {
    const type = getFilterType();
    if (!type) return;
    handleFilter(type);
};

export const affineGrayscaleSlope = ref(1);
export const affineGrayscaleDistance = ref(0);

export function optimalAffineGrayscaleTransform() {
    if (!imageBuffer.value) return;
    var max = 0;
    var min = Infinity;
    for (const val of imageBuffer.value.floatBuffer) {
        max = Math.max(max, val);
        min = Math.min(min, val);
    }

    max *= 255;
    min *= 255;

    // f(min) = 0.0
    // f(max) = 255.0
    if (max === min) {
        console.warn("Image has zero contrast (min === max).");
        return;
    }
    const slope = 255 / (max - min);
    const distance = -min * slope;
    affineGrayscaleSlope.value = slope;
    affineGrayscaleDistance.value = distance;
}