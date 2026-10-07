import { Noise, NoiseType } from "./noise"
import { API_BASE_URL } from "@/config";

export class UniformNoise extends Noise {
    baseURL : string;
    noiseType: NoiseType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/noise/uniform`;
        this.noiseType = NoiseType.additive;
    }

    public getParameters() : Array<[string, string]> {
        const rangeObject : HTMLSelectElement | null = document.getElementById("uniformNoiseRange") as HTMLSelectElement;
        let range = 0;
        if (rangeObject) {
            range = Number(rangeObject.value);
        }
        return [["range", range.toString()]]
    }
}