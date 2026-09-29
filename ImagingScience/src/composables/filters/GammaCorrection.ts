import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { API_BASE_URL } from "@/config";

export class GammaCorrection extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/filter/gamma`;
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
