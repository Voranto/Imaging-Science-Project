import { API_BASE_URL } from "@/config";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
export class HistogramEqualization extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = `${API_BASE_URL}/filter/histogramEqualization`;
        this.filterType = FilterType.histogramEqualization;
    }

    public getParameters() : [string, string][] {
        return []
    }
}
