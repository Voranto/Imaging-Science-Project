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

export function getSimpleEdges() {
    simpleEdgeInstance.applyFilter();
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
export function getCornerTomasi(){
    cornerTomasiInstance.applyFilter();
}

export function getCornerRohr(){
    cornerRohrInstance.applyFilter();
}

export function getCornerHarris(){
    cornerHarrisInstance.applyFilter();
}

export function getDilation(){
    dilationInstance.applyFilter();
}

export function getErosion(){
    erosionInstance.applyFilter();
}
export function getOpening(){
    openingInstance.applyFilter();
}
export function getClosing(){
    closingInstance.applyFilter();
}
export function getWhiteTopHat(){
    whiteTopHatInstance.applyFilter();
}
export function getBlackTopHat(){
    blackTopHatInstance.applyFilter();
}
export function getSelfdualTopHat(){
    selfdualTopHatInstance.applyFilter();
}
export function getMedian() {
    medianInstance.applyFilter();
}
export function getWaveletShrinkage() {
    waveletShrinkage.applyFilter();
}

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
export const handleFilter = (type: string) => {
  if (type === 'simple-edge') getSimpleEdges();
  if (type === 'canny') getCannys();
  if (type === 'highpass') getHighpassFilter();
  if (type === 'lowpass') getLowpassFilter();
  if (type === 'gamma') getGammaCorrection();
  if (type === 'cornerTomasi') getCornerTomasi();
  if (type === 'cornerRohr') getCornerRohr();
  if (type === 'cornerHarris') getCornerHarris();
  if (type === 'erosion') getErosion();
  if (type === 'dilation') getDilation();
  if (type === 'opening') getOpening();
  if (type === 'closing') getClosing();
  if (type === 'whiteTopHat') getWhiteTopHat();
  if (type === 'blackTopHat') getBlackTopHat();
  if (type === 'selfdualTopHat') getSelfdualTopHat();
  if (type === 'median') getMedian();
  if (type === "waveletShrinkage") getWaveletShrinkage();
};
export function updateCurrentFilter() {
    const type = getFilterType();
    if (!type) return;
    handleFilter(type);
};