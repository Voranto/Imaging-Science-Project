import { Noise, NoiseType } from "./noise"

export class ImpulseNoise extends Noise {
    baseURL : string;
    noiseType: NoiseType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/noise/impulse";
        this.noiseType = NoiseType.impulse;
    }

    public getParameters() : Array<any> {
        var highObject : HTMLSelectElement | null = document.getElementById("impulseNoiseHigh") as HTMLSelectElement;
        var high = 0;
        if (highObject) {
            high = Number(highObject.value);
        }
        var lowObject : HTMLSelectElement | null = document.getElementById("impulseNoiseLow") as HTMLSelectElement;
        var low = 0;
        if (lowObject) {
            low = Number(lowObject.value);
        }
        var probObject : HTMLSelectElement | null = document.getElementById("impulseNoiseProbability") as HTMLSelectElement;
        var prob = 0;
        if (probObject) {
            prob = Number(probObject.value);
        }
        return [["high", high], ["low", low], ["probability", prob]];
    }
}