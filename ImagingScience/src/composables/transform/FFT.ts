import { Transform, TransformType } from "./transform"

export class FFT extends Transform {
    baseURL : string;
    transformType: TransformType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/fft";
        this.transformType = TransformType.fft;
    }

    public getParameters() : Array<any> {
        return []
    }
}