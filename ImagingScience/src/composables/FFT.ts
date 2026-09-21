import { Transform, TransformType } from "./transform"
import { ref, type Ref } from 'vue';
import { Canvas } from 'fabric'


export const transformRequested : Ref<boolean> = ref(false);
export const transformCanvas = ref<Canvas | null>(null);

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