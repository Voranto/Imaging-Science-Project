import { Filter, FilterType } from "./Filter";
export class Highpass extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/filter/highpass";
        this.filterType = FilterType.highpass;
    }

    public getParameters() : Array<any> {
        var sigmaObject : HTMLSelectElement | null = document.getElementById("highpassFilterSigma") as HTMLSelectElement;
        var sigma = 0;
        if (sigmaObject) {
            sigma = Number(sigmaObject.value);
        }
        return [["sigma", sigma]]
    }
}
