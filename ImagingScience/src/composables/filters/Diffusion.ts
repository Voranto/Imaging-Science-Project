import { Filter, FilterType } from "./Filter";
export class Diffusion extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/filter/diffusion";
        this.filterType = FilterType.diffusion;
    }

    public getParameters() : Array<any> {
        var timeObject : HTMLSelectElement | null = document.getElementById("diffusionTime") as HTMLSelectElement;
        var time = 0;
        if (timeObject) {
            time = Number(timeObject.value);
        }
        var contrastObject : HTMLSelectElement | null = document.getElementById("diffusionContrast") as HTMLSelectElement;
        var contrast = 0;
        if (contrastObject) {
            contrast = Number(contrastObject.value);
        }

        return [["time", time], ["contrast", contrast]]
    }
}
