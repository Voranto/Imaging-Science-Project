import { Filter } from "./Filter";
import { API_BASE_URL } from "@/config";
import { FilterType } from "./FilterType";

export class Cannys extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/filter/edge/canny`;
        this.filterType = FilterType.cannys;
    }

    public getParameters() : Array<any> {
        var thresholdWeakObject : HTMLSelectElement | null = document.getElementById("thresholdCannyWeak") as HTMLSelectElement;
        var thresholdWeak = 0;
        if (thresholdWeakObject) {
            thresholdWeak = Number(thresholdWeakObject.value);
        }
        var thresholdStrongObject : HTMLSelectElement | null = document.getElementById("thresholdCannyStrong") as HTMLSelectElement;
        var thresholdStrong = 0;
        if (thresholdStrongObject) {
            thresholdStrong = Number(thresholdStrongObject.value);
        }
        var applyGaussianObject : HTMLInputElement | null = document.getElementById("applyGaussianCanny") as HTMLInputElement;
        var applyGaussian = true;
        if (applyGaussianObject) {
            applyGaussian = Boolean(applyGaussianObject.checked);
        }
        return [["applyGaussian", applyGaussian], ["thresholdWeak", thresholdWeak], ["thresholdStrong", thresholdStrong]]
    }
}
