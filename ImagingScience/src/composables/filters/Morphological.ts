import { Filter, FilterType } from "./Filter";

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
        this.baseURL = "http://localhost:8000/api/filter/morphological/" + type;
        this.filterType = FILTER_TYPE_MAP[type]!;
    }

    public getParameters() : Array<any> {
        var radiusObject : HTMLSelectElement | null = document.getElementById("morphologicalRadius") as HTMLSelectElement;
        var radius = 0;
        if (radiusObject) {
            radius = Number(radiusObject.value);
        }
        var typeMask : HTMLSelectElement | null = document.getElementById("morphologicalMaskType") as HTMLSelectElement;
        var circle = true;
        if (typeMask) {
            circle = typeMask.value === "circle";
        }
        return [["radius", radius], ["circle", circle]]
    }
}
