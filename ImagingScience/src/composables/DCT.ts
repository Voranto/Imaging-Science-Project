import { Transform, TransformType } from "./transform"

export class DCT extends Transform {
    baseURL : string;
    transformType: TransformType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/dct";
        this.transformType = TransformType.dct;
    }

    public getParameters() : Array<any> {
        return []
    }
}