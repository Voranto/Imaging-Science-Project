import { Filter, FilterType } from "./Filter";
export class Bilateral extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/filter/bilateral";
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
