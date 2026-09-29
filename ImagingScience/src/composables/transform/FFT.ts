import { Filter } from "../filters/Filter";
import { API_BASE_URL } from "@/config";

import { Transform, TransformType } from "./transform"

export class FFT extends Transform {
    baseURL : string;
    transformType: TransformType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/fft`;
        this.transformType = TransformType.fft;
    }

    public getParameters() : Array<any> {
        return []
    }
}