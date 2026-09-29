import { Filter } from "../filters/Filter";
import { Noise, NoiseType } from "./noise"
import { API_BASE_URL } from "@/config";

export class GaussianNoise extends Noise {
    baseURL : string;
    noiseType: NoiseType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/noise/gaussian`;
        this.noiseType = NoiseType.gaussian;
    }

    public getParameters() : Array<any> {
        var meanObject : HTMLSelectElement | null = document.getElementById("gaussianNoiseMean") as HTMLSelectElement;
        var mean = 0;
        if (meanObject) {
            mean = Number(meanObject.value);
        }
        var sigmaObject : HTMLSelectElement | null = document.getElementById("gaussianNoiseSigma") as HTMLSelectElement;
        var sigma = 0;
        if (sigmaObject) {
            sigma = Number(sigmaObject.value);
        }
        return [["mean", mean.toString()], ["sigma", sigma.toString()]]
    }
}