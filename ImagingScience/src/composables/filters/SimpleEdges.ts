import { Filter, FilterType } from "./Filter";
export class SimpleEdges extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/filter/edge/simple";
        this.filterType = FilterType.simpleEdge;
    }

    public getParameters() : Array<any> {
        var thresholdObject : HTMLSelectElement | null = document.getElementById("simpleEdgeThreshold") as HTMLSelectElement;
        var threshold = 0;
        if (thresholdObject) {
            threshold = Number(thresholdObject.value);
        }

        var applyGaussianObject : HTMLInputElement | null = document.getElementById("applyGaussianSimpleEdges") as HTMLInputElement;
        var applyGaussian = true;
        if (applyGaussianObject) {
            applyGaussian = Boolean(applyGaussianObject.checked);
        }
        return [["applyGaussian", applyGaussian], ["threshold", threshold]]
    }
}
