import { Filter, FilterType } from "./Filter";
export class NLMeans extends Filter {
    baseURL : string;
    filterType: FilterType;

    public constructor() {
        super();
        this.baseURL = "http://localhost:8000/api/filter/nlmeans";
        this.filterType = FilterType.NLMeans;
    }

    public getParameters() : Array<any> {
        var sigmaObject : HTMLSelectElement | null = document.getElementById("NLMeansSigma") as HTMLSelectElement;
        var sigma = 0;
        if (sigmaObject) {
            sigma = Number(sigmaObject.value);
        }
        var radiusObject : HTMLSelectElement | null = document.getElementById("NLMeansRadius") as HTMLSelectElement;
        var radius = 0;
        if (radiusObject) {
            radius = Number(radiusObject.value);
        }

        return [["sigma", sigma], ["maskRadius", radius]]
    }
}
