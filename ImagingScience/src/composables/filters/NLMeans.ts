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
        var radiusPatchObject : HTMLSelectElement | null = document.getElementById("NLMeansRadiusPatch") as HTMLSelectElement;
        var radiusPatch = 0;
        if (radiusPatchObject) {
            radiusPatch = Number(radiusPatchObject.value);
        }
        var radiusWindowObject : HTMLSelectElement | null = document.getElementById("NLMeansRadiusWindow") as HTMLSelectElement;
        var radiusWindow = 0;
        if (radiusWindowObject) {
            radiusWindow = Number(radiusWindowObject.value);
        }
        var strengthObject : HTMLSelectElement | null = document.getElementById("NLMeansStrength") as HTMLSelectElement;
        var strength = 0;
        if (strengthObject) {
            strength = Number(strengthObject.value);
        }

        return [["radiusPatch", radiusPatch], ["radiusWindow", radiusWindow], ["filterStrength", strength]]
    }
}
