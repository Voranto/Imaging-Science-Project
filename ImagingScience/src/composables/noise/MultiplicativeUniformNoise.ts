import { Noise, NoiseType } from "./noise"

export class MultiplicativeUniformNoise extends Noise {
    baseURL : string;
    noiseType: NoiseType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/noise/multiplicative/uniform";
        this.noiseType = NoiseType.multiplicative;
    }

    public getParameters() : Array<any> {
        var rangeObject : HTMLSelectElement | null = document.getElementById("uniformMultNoiseRange") as HTMLSelectElement;
        var range = 0;
        if (rangeObject) {
            range = Number(rangeObject.value);
        }
        return [["range", range.toString()]]
    }
}