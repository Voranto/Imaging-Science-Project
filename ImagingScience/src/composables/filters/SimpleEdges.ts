import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { API_BASE_URL } from "@/config";

export class SimpleEdges extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/filter/edge/simple`;
        this.filterType = FilterType.simpleEdge;
    }

    public getParameters() : [string, string |boolean][] {
        const thresholdObject : HTMLSelectElement | null = document.getElementById("simpleEdgeThreshold") as HTMLSelectElement;
        let threshold = 0;
        if (thresholdObject) {
            threshold = Number(thresholdObject.value);
        }

        const applyGaussianObject : HTMLInputElement | null = document.getElementById("applyGaussianSimpleEdges") as HTMLInputElement;
        let applyGaussian = true;
        if (applyGaussianObject) {
            applyGaussian = Boolean(applyGaussianObject.checked);
        }
        return [["applyGaussian", applyGaussian], ["threshold", threshold.toString()]]
    }
}
