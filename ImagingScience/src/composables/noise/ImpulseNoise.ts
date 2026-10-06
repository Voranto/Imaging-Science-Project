import { Filter } from "../filters/Filter";
import { Noise, NoiseType } from "./noise"
import { API_BASE_URL } from "@/config";

export class ImpulseNoise extends Noise {
    baseURL : string;
    noiseType: NoiseType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/noise/impulse`;
        this.noiseType = NoiseType.impulse;
    }

    public getParameters() : Array<any> {
        let highObject : HTMLSelectElement | null = document.getElementById("impulseNoiseHigh") as HTMLSelectElement;
        let high = 0;
        if (highObject) {
            high = Number(highObject.value);
        }
        let lowObject : HTMLSelectElement | null = document.getElementById("impulseNoiseLow") as HTMLSelectElement;
        let low = 0;
        if (lowObject) {
            low = Number(lowObject.value);
        }
        let probObject : HTMLSelectElement | null = document.getElementById("impulseNoiseProbability") as HTMLSelectElement;
        let prob = 0;
        if (probObject) {
            prob = Number(probObject.value);
        }
        return [["high", high], ["low", low], ["probability", prob]];
    }
}