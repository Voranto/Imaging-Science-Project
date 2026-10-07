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

    public getParameters() : [string, string][] {
        const thresholdWeakObject : HTMLSelectElement | null = document.getElementById("thresholdCannyWeak") as HTMLSelectElement;
        let thresholdWeak = 0;
        if (thresholdWeakObject) {
            thresholdWeak = Number(thresholdWeakObject.value);
        }
        const thresholdStrongObject : HTMLSelectElement | null = document.getElementById("thresholdCannyStrong") as HTMLSelectElement;
        let thresholdStrong = 0;
        if (thresholdStrongObject) {
            thresholdStrong = Number(thresholdStrongObject.value);
        }
        const applyGaussianObject : HTMLInputElement | null = document.getElementById("applyGaussianCanny") as HTMLInputElement;
        let applyGaussian = true;
        if (applyGaussianObject) {
            applyGaussian = Boolean(applyGaussianObject.checked);
        }
        return [["applyGaussian", applyGaussian.toString()], ["thresholdWeak", thresholdWeak.toString()], ["thresholdStrong", thresholdStrong.toString()]]
    }
}
