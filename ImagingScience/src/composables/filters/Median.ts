import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { API_BASE_URL } from "@/config";

export class Median extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/filter/median`;
        this.filterType = FilterType.median;
    }

    public getParameters() : Array<any> {
        let radiusObject : HTMLSelectElement | null = document.getElementById("medianRadius") as HTMLSelectElement;
        let radius = 0;
        if (radiusObject) {
            radius = Number(radiusObject.value);
        }
        return [["radius", radius]]
    }
}
