import { Filter } from "../filters/Filter";
import { Noise, NoiseType } from "./noise"
import { API_BASE_URL } from "@/config";

export class MultiplicativeGaussianNoise extends Noise {
    baseURL : string;
    noiseType: NoiseType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/noise/multiplicative/gaussian`;
        this.noiseType = NoiseType.multiplicative_gaussian;
    }

    public getParameters() : Array<any> {
        let meanObject : HTMLSelectElement | null = document.getElementById("gaussianMultNoiseMean") as HTMLSelectElement;
        let mean = 0;
        if (meanObject) {
            mean = Number(meanObject.value);
        }
        let sigmaObject : HTMLSelectElement | null = document.getElementById("gaussianMultNoiseSigma") as HTMLSelectElement;
        let sigma = 0;
        if (sigmaObject) {
            sigma = Number(sigmaObject.value);
        }
        return [["mean", mean.toString()], ["sigma", sigma.toString()]]
    }
}