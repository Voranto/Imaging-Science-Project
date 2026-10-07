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

    public getParameters() : [string, string][] {
        const highObject : HTMLSelectElement | null = document.getElementById("impulseNoiseHigh") as HTMLSelectElement;
        let high = 0;
        if (highObject) {
            high = Number(highObject.value);
        }
        const lowObject : HTMLSelectElement | null = document.getElementById("impulseNoiseLow") as HTMLSelectElement;
        let low = 0;
        if (lowObject) {
            low = Number(lowObject.value);
        }
        const probObject : HTMLSelectElement | null = document.getElementById("impulseNoiseProbability") as HTMLSelectElement;
        let prob = 0;
        if (probObject) {
            prob = Number(probObject.value);
        }
        return [["high", high.toString()], ["low", low.toString()], ["probability", prob.toString()]];
    }
}