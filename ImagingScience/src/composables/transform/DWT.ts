import { Filter } from "../filters/Filter";
import { Transform, TransformType } from "./transform"
import { API_BASE_URL } from "@/config";

export class DWT extends Transform {
    baseURL : string;
    transformType: TransformType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/dwt`;
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