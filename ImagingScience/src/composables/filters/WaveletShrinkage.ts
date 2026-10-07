import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { API_BASE_URL } from "@/config";

export class WaveletShrinkage extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/filter/wavelet/`;
        this.filterType = FilterType.waveletShrinkage;
    }

    public getParameters() : [string , string][] {
        const thresholdObject : HTMLSelectElement | null = document.getElementById("waveletShrinkageThreshold") as HTMLSelectElement;
        let threshold = 0;
        if (thresholdObject) {
            threshold = Number(thresholdObject.value);
        }
        const typeObject : HTMLSelectElement | null = document.getElementById("waveletShrinkageMode") as HTMLSelectElement;
        let type = "";
        if (typeObject) {
            type = typeObject.value;
        }
        return [["threshold", threshold.toString()], ["type", type.toString()]]
    }
}
