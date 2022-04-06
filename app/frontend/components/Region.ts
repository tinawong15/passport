import { RegionGeoJson, SubregionGeoJson } from '../../models/RegionModel';

export class Region implements RegionGeoJson {
    type: "FeatureCollection";
    properties: {
        subregions_have_names: boolean;
        subregions_have_capitals: boolean;
        subregions_have_leaders: boolean;
        subregions_have_flags: boolean;
        subregions_have_landmarks: boolean;
        subregion_type: string;
    }
    features: Array<SubregionGeoJson>;
    subregions: Map<string, SubregionGeoJson>;
    name:string;
    path:string;

    constructor(regionGeoJson: RegionGeoJson, name:string, path:string) {
        this.properties = regionGeoJson.properties;
        this.features = regionGeoJson.features;
        this.subregions = new Map<string, SubregionGeoJson>();
        for (let subregion of this.features) {
            this.subregions.set(subregion.properties.name ? subregion.properties.name : subregion.properties.id, subregion);
        }
        this.name = name;
        this.path = path;
    }

    public getFlagURL(subregion_name?: string):string {
        if (arguments.length == 0) {
            return `/img/${this.path} Flag.png`;
        }
        else if (this.subregions.has(subregion_name)) {
            if (this.properties.subregions_have_flags)
                return `/img/${this.path}/${subregion_name} Flag.png`;
            else throw "The subregions of " + name + " don't have flags";
        }
        else throw "Invalid Input"
    }

    public getSubregionFlagURLs():string[] {
        let output = [];
        for (let [name, subregion] of this.subregions) {
            output.push(this.getFlagURL(name));
        }
        return output;
    }
}