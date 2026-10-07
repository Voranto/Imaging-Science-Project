import { API_BASE_URL } from "@/config";

import { imageID, Transform, TransformType } from "./transform"
import axios from "axios";

export class FFT extends Transform {
    baseURL : string;
    transformType: TransformType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/fft`;
        this.transformType = TransformType.fft;
    }

    public async applyFrequencyFilter(low : number, high: number, cutoff: number) {
        
        if (!imageID) return;
        try {
            const response = await axios.post<Blob>(this.baseURL + "/filter", {},{
            params: { image_id: imageID.value, low: low, high: high, cutoff: cutoff },
            responseType: 'blob',
            });
            await this.renderImageResult(response);

        } catch (error) {
            console.error('Inverse computation failed:', error);
        }
    }

    public getParameters() : Array<[string, string]> {
        return []
    }
}