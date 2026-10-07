import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { API_BASE_URL } from "@/config";

export class Lowpass extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/filter/lowpass`;
        this.filterType = FilterType.lowpass;
    }

    public getParameters() : Array<[string, string]> {
        const sigmaObject : HTMLSelectElement | null = document.getElementById("lowpassFilterSigma") as HTMLSelectElement;
        let sigma = 0;
        if (sigmaObject) {
            sigma = Number(sigmaObject.value);
        }
        return [["sigma", sigma.toString()]]
    }
}
