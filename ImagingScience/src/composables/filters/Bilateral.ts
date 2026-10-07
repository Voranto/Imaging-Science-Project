import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { API_BASE_URL } from "@/config";

export class Bilateral extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/filter/bilateral`;
        console.log(this.baseURL);
        this.filterType = FilterType.bilateral;
    }

    public getParameters() : [string, string][] {
        const spatialObject : HTMLSelectElement | null = document.getElementById("bilateralSigmaSpatial") as HTMLSelectElement;
        let spatial = 0;
        if (spatialObject) {
            spatial = Number(spatialObject.value);
        }
        const tonalObject : HTMLSelectElement | null = document.getElementById("bilateralSigmaTonal") as HTMLSelectElement;
        let tonal = 0;
        if (tonalObject) {
            tonal = Number(tonalObject.value);
        }
        return [["sigmaSpatial", spatial.toString()], ["sigmaTonal", tonal.toString()]]
    }
}
