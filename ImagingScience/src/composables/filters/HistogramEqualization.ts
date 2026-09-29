import { Filter, FilterType } from "./Filter";
export class HistogramEqualization extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/filter/histogramEqualization";
        this.filterType = FilterType.histogramEqualization;
    }

    public getParameters() : Array<any> {
        return []
    }
}
