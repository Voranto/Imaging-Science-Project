import { Transform, TransformType } from "./transform"

export class DWT extends Transform {
    baseURL : string;
    transformType: TransformType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/dwt";
        this.transformType = TransformType.dwt;
    }

    public getParameters() : Array<any> {
        var levelsObject : HTMLSelectElement | null = document.getElementById("dwtLevel") as HTMLSelectElement;
        var level = 0;
        if (levelsObject) {
            level = Number(levelsObject.value);
        }
        return [["levels", level.toString()]]
    }
}