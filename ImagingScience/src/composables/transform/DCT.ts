import { API_BASE_URL } from "@/config";
import { Transform, TransformType } from "./transform"

export class DCT extends Transform {
    baseURL : string;
    transformType: TransformType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/dct`;
        this.transformType = TransformType.dct;
    }

    public getParameters() : [string, string][] {
        return []
    }
}