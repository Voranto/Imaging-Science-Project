import { Noise, NoiseType } from "./noise"

export class MultiplicativeGaussianNoise extends Noise {
    baseURL : string;
    noiseType: NoiseType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/noise/multiplicative/gaussian";
        this.noiseType = NoiseType.multiplicative_gaussian;
    }

    public getParameters() : Array<any> {
        var meanObject : HTMLSelectElement | null = document.getElementById("gaussianMultNoiseMean") as HTMLSelectElement;
        var mean = 0;
        if (meanObject) {
            mean = Number(meanObject.value);
        }
        var sigmaObject : HTMLSelectElement | null = document.getElementById("gaussianMultNoiseSigma") as HTMLSelectElement;
        var sigma = 0;
        if (sigmaObject) {
            sigma = Number(sigmaObject.value);
        }
        return [["mean", mean.toString()], ["sigma", sigma.toString()]]
    }
}