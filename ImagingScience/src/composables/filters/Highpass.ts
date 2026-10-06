import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { API_BASE_URL } from "@/config";

export class Highpass extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/filter/highpass`;
        this.filterType = FilterType.highpass;
    }

    public getParameters() : Array<any> {
        let sigmaObject : HTMLSelectElement | null = document.getElementById("highpassFilterSigma") as HTMLSelectElement;
        let sigma = 0;
        if (sigmaObject) {
            sigma = Number(sigmaObject.value);
        }
        return [["sigma", sigma]]
    }
}
