import { Filter } from "../filters/Filter";
import { Noise, NoiseType } from "./noise"
import { API_BASE_URL } from "@/config";

export class MultiplicativeUniformNoise extends Noise {
    baseURL : string;
    noiseType: NoiseType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/noise/multiplicative/uniform`;
        this.noiseType = NoiseType.multiplicative_uniform;
    }

    public getParameters() : Array<any> {
        const rangeObject : HTMLSelectElement | null = document.getElementById("uniformMultNoiseRange") as HTMLSelectElement;
        let range = 0;
        if (rangeObject) {
            range = Number(rangeObject.value);
        }
        return [["range", range.toString()]]
    }
}