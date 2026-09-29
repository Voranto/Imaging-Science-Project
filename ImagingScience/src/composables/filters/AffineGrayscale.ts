import { Filter, FilterType } from "./Filter";
export class AffineGrayscale extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/filter/affineGrayscale";
        this.filterType = FilterType.affineGrayscale;
    }

    public getParameters() : Array<any> {
        var slopeObject : HTMLSelectElement | null = document.getElementById("affineGrayscaleSlope") as HTMLSelectElement;
        var slope = 0;
        if (slopeObject) {
            slope = Number(slopeObject.value);
        }
        var distanceObject : HTMLSelectElement | null = document.getElementById("affineGrayscaleDistance") as HTMLSelectElement;
        var distance = 0;
        if (distanceObject) {
            distance = Number(distanceObject.value);
        }
        return [["slope", slope], ["distance", distance]]
    }
}
