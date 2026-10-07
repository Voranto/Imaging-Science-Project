import { API_BASE_URL } from "@/config";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
export class AffineGrayscale extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/filter/affineGrayscale`;
        this.filterType = FilterType.affineGrayscale;
    }

    public getParameters() : Array<[string, string]> {
        const slopeObject : HTMLSelectElement | null = document.getElementById("affineGrayscaleSlope") as HTMLSelectElement;
        let slope = 0;
        if (slopeObject) {
            slope = Number(slopeObject.value);
        }
        const distanceObject : HTMLSelectElement | null = document.getElementById("affineGrayscaleDistance") as HTMLSelectElement;
        let distance = 0;
        if (distanceObject) {
            distance = Number(distanceObject.value);
        }
        return [["slope", slope.toString()], ["distance", distance.toString()]]
    }
}
