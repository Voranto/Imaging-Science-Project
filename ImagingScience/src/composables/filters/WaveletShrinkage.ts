import { Filter, FilterType } from "./Filter";

export class WaveletShrinkage extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/filter/wavelet/";
        this.filterType = FilterType.waveletShrinkage;
    }

    public getParameters() : Array<any> {
        var thresholdObject : HTMLSelectElement | null = document.getElementById("waveletShrinkageThreshold") as HTMLSelectElement;
        var threshold = 0;
        if (thresholdObject) {
            threshold = Number(thresholdObject.value);
        }
        var typeObject : HTMLSelectElement | null = document.getElementById("waveletShrinkageMode") as HTMLSelectElement;
        var type = "";
        if (typeObject) {
            type = typeObject.value;
        }
        return [["threshold", threshold], ["type", type]]
    }
}
