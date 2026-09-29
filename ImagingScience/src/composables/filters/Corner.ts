import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { API_BASE_URL } from "@/config";


const FILTER_TYPE_MAP: Record<string, FilterType> = {
  tomasi: FilterType.cornerTomasi,
  harris: FilterType.cornerHarris,
  rohr: FilterType.cornerRohr,
};

export class Corner extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor(derivative: string,type : string) {
        super();
        this.baseURL = `${API_BASE_URL}/filter/corner/` + derivative +"/" + type;
        this.filterType = FILTER_TYPE_MAP[type]!;
    }

    public getParameters() : Array<any> {
        var thresholdObject : HTMLSelectElement | null = document.getElementById("cornerThreshold") as HTMLSelectElement;
        var threshold = 0;
        if (thresholdObject) {
            threshold = Number(thresholdObject.value);
        }
        var sigmaObject : HTMLSelectElement | null = document.getElementById("cornerSigma") as HTMLSelectElement;
        var sigma = 0;
        if (sigmaObject) {
            sigma = Number(sigmaObject.value);
        }
        var rhoObject : HTMLInputElement | null = document.getElementById("cornerRho") as HTMLInputElement;
        var rho = 0;
        if (rhoObject) {
            rho = Number(rhoObject.value);
        }
        return [["threshold", threshold], ["sigma", sigma], ["rho", rho]]
    }
}
