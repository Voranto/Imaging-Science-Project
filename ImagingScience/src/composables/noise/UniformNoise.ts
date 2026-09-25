import { Noise, NoiseType } from "./noise"

export class UniformNoise extends Noise {
    baseURL : string;
    noiseType: NoiseType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/noise/uniform";
        this.noiseType = NoiseType.additive;
    }

    public getParameters() : Array<any> {
        var rangeObject : HTMLSelectElement | null = document.getElementById("uniformNoiseRange") as HTMLSelectElement;
        var range = 0;
        if (rangeObject) {
            range = Number(rangeObject.value);
        }
        return [["range", range.toString()]]
    }
}