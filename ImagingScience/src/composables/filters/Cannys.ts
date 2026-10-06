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
        let thresholdWeakObject : HTMLSelectElement | null = document.getElementById("thresholdCannyWeak") as HTMLSelectElement;
        let thresholdWeak = 0;
        if (thresholdWeakObject) {
            thresholdWeak = Number(thresholdWeakObject.value);
        }
        let thresholdStrongObject : HTMLSelectElement | null = document.getElementById("thresholdCannyStrong") as HTMLSelectElement;
        let thresholdStrong = 0;
        if (thresholdStrongObject) {
            thresholdStrong = Number(thresholdStrongObject.value);
        }
        let applyGaussianObject : HTMLInputElement | null = document.getElementById("applyGaussianCanny") as HTMLInputElement;
        let applyGaussian = true;
        if (applyGaussianObject) {
            applyGaussian = Boolean(applyGaussianObject.checked);
        }
        return [["applyGaussian", applyGaussian], ["thresholdWeak", thresholdWeak], ["thresholdStrong", thresholdStrong]]
    }
}
