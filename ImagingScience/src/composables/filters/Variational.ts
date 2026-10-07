import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { API_BASE_URL } from "@/config";

export class Variational extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/filter/global/variational`;
        this.filterType = FilterType.variational;
    }

    public getParameters() : [string, string |boolean][] {
        const regularisationObject : HTMLSelectElement | null = document.getElementById("variationalParameter") as HTMLSelectElement;
        let regularisation = 0;
        if (regularisationObject) {
            regularisation = Number(regularisationObject.value);
        }
        return [["regularisation", regularisation.toString()]]
    }
}
