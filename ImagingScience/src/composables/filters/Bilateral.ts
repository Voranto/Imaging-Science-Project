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

    public getParameters() : Array<any> {
        var spatialObject : HTMLSelectElement | null = document.getElementById("bilateralSigmaSpatial") as HTMLSelectElement;
        var spatial = 0;
        if (spatialObject) {
            spatial = Number(spatialObject.value);
        }
        var tonalObject : HTMLSelectElement | null = document.getElementById("bilateralSigmaTonal") as HTMLSelectElement;
        var tonal = 0;
        if (tonalObject) {
            tonal = Number(tonalObject.value);
        }
        return [["sigmaSpatial", spatial], ["sigmaTonal", tonal]]
    }
}
