import { ref, type Ref } from "vue";

export const filterRequested : Ref<boolean> = ref(false);
export const filterImageSrc : Ref<string> = ref("");
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
    affineGrayscale = "affineGrayscale",
    histogramEqualization = "histogramEqualization",
    variational = "variational",
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