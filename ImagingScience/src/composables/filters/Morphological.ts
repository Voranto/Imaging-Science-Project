import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { API_BASE_URL } from "@/config";

const FILTER_TYPE_MAP: Record<string, FilterType> = {
  dilation: FilterType.dilation,
  erosion: FilterType.erosion,
  opening: FilterType.opening,
  closing: FilterType.closing,
  whiteTopHat: FilterType.whiteTopHat,
  blackTopHat: FilterType.blackTopHat,
  selfdualTopHat: FilterType.selfdualTopHat,
};

export class Morphological extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor(type : string) {
        super();
        this.baseURL = `${API_BASE_URL}/filter/morphological/` + type;
        this.filterType = FILTER_TYPE_MAP[type]!;
    }

    public getParameters() : Array<any> {
        let radiusObject : HTMLSelectElement | null = document.getElementById("morphologicalRadius") as HTMLSelectElement;
        let radius = 0;
        if (radiusObject) {
            radius = Number(radiusObject.value);
        }
        let typeMask : HTMLSelectElement | null = document.getElementById("morphologicalMaskType") as HTMLSelectElement;
        let circle = true;
        if (typeMask) {
            circle = typeMask.value === "circle";
        }
        return [["radius", radius], ["circle", circle]]
    }
}
