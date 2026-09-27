import { Filter, FilterType } from "./Filter";
export class Median extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/filter/median";
        this.filterType = FilterType.median;
    }

    public getParameters() : Array<any> {
        var radiusObject : HTMLSelectElement | null = document.getElementById("medianRadius") as HTMLSelectElement;
        var radius = 0;
        if (radiusObject) {
            radius = Number(radiusObject.value);
        }
        return [["radius", radius]]
    }
}
