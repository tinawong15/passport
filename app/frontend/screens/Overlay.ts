import { Region } from "../components/Region";
import { ScreenEnum } from "../managers/ScreenManager";
import { Screen } from "./Screen";

export abstract class Overlay extends Screen {
    private subregionType: string;
    protected isDataLoaded: boolean;
    public overlayElement: JQuery;

    public constructor(name:ScreenEnum, queries:URLSearchParams){
        super(name, true, queries);
    }

    public ready() {
        super.ready();
        if (this.subregionType)
            $('#subregion-type').text("'s " + this.subregionType);
        else 
            // To prevent race conditon between init and dataLoaded
            Object.defineProperty(this, 'subregionType', {
                configurable: true,
                get: function() {
                    return this._subregionType;
                },
                set: function(subregionType: string) {
                    this._subregionType = subregionType;
                    $('#subregion-type').text("'s " + this.subregionType);
                }
            });
    }

    public dataLoaded(region:Region):void {
        this.isDataLoaded = true;
        if (region.name.toLowerCase().includes(region.properties.subregion_type.toLowerCase())) 
            // Prevents the following "United States's States", "United Arab Emirates's Emirates", etc.
            return;
        this.subregionType = region.properties.subregion_type;
    }
}