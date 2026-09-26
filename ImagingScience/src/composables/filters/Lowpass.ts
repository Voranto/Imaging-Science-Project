import { Filter, FilterType } from "./Filter";
export class Lowpass extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/filter/lowpass";
        this.filterType = FilterType.lowpass;
    }

    public getParameters() : Array<any> {
        var sigmaObject : HTMLSelectElement | null = document.getElementById("lowpassFilterSigma") as HTMLSelectElement;
        var sigma = 0;
        if (sigmaObject) {
            sigma = Number(sigmaObject.value);
        }
        return [["sigma", sigma]]
    }
}
