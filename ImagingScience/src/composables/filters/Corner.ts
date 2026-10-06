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
        let thresholdObject : HTMLSelectElement | null = document.getElementById("cornerThreshold") as HTMLSelectElement;
        let threshold = 0;
        if (thresholdObject) {
            threshold = Number(thresholdObject.value);
        }
        let sigmaObject : HTMLSelectElement | null = document.getElementById("cornerSigma") as HTMLSelectElement;
        let sigma = 0;
        if (sigmaObject) {
            sigma = Number(sigmaObject.value);
        }
        let rhoObject : HTMLInputElement | null = document.getElementById("cornerRho") as HTMLInputElement;
        let rho = 0;
        if (rhoObject) {
            rho = Number(rhoObject.value);
        }
        return [["threshold", threshold], ["sigma", sigma], ["rho", rho]]
    }
}
