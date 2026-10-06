import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { API_BASE_URL } from "@/config";

export class Diffusion extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/filter/diffusion`;
        this.filterType = FilterType.diffusion;
    }

    public getParameters() : Array<any> {
        let timeObject : HTMLSelectElement | null = document.getElementById("diffusionTime") as HTMLSelectElement;
        let time = 0;
        if (timeObject) {
            time = Number(timeObject.value);
        }
        let contrastObject : HTMLSelectElement | null = document.getElementById("diffusionContrast") as HTMLSelectElement;
        let contrast = 0;
        if (contrastObject) {
            contrast = Number(contrastObject.value);
        }
        let optionObject : HTMLSelectElement | null = document.getElementById("diffusionOption") as HTMLSelectElement;
        let option = 0;
        if (optionObject) {
            option = Number(optionObject.value);
        }

        return [["iterations", time], ["contrast", contrast], ["diffusivityOption", option]]
    }
}
