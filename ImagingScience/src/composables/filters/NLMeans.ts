import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { API_BASE_URL } from "@/config";

export class NLMeans extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/filter/NLMeans`;
        this.filterType = FilterType.NLMeans;
    }

    public getParameters() : Array<any> {
        let radiusPatchObject : HTMLSelectElement | null = document.getElementById("NLMeansRadiusPatch") as HTMLSelectElement;
        let radiusPatch = 0;
        if (radiusPatchObject) {
            radiusPatch = Number(radiusPatchObject.value);
        }
        let radiusWindowObject : HTMLSelectElement | null = document.getElementById("NLMeansRadiusWindow") as HTMLSelectElement;
        let radiusWindow = 0;
        if (radiusWindowObject) {
            radiusWindow = Number(radiusWindowObject.value);
        }
        let strengthObject : HTMLSelectElement | null = document.getElementById("NLMeansStrength") as HTMLSelectElement;
        let strength = 0;
        if (strengthObject) {
            strength = Number(strengthObject.value);
        }

        return [["radiusPatch", radiusPatch], ["radiusWindow", radiusWindow], ["filterStrength", strength]]
    }
}
