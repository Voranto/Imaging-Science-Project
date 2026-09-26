import { Filter, FilterType } from "./Filter";
export class GammaCorrection extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/filter/gamma";
        this.filterType = FilterType.gammaCorrection;
    }

    public getParameters() : Array<any> {
        var gammaObject : HTMLSelectElement | null = document.getElementById("gammaCorrectionValue") as HTMLSelectElement;
        var gamma = 0;
        if (gammaObject) {
            gamma = Number(gammaObject.value);
        }
        return [["gamma", gamma]]
    }
}
