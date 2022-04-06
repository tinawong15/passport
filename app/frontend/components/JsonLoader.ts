import { MapController } from '../controllers/MapController';
import { SubregionColor } from '../controllers/SubregionColorController';
import { toast } from './toast';
import { RegionGeoJson, SubregionGeoJson } from "../../models/RegionModel";
import { ScreenEnum } from '../managers/ScreenManager';
import { Region } from './Region';

export function loadGeoJSON(screen:ScreenEnum, path: string, callback:(mapController: MapController, region:RegionGeoJson)=>void):void {
    let name = path.split('/').pop();
    let url = new URL('/data/' + path, window.location.origin);
    url.searchParams.set('s', screen);
    $.getJSON(url.toString(), (data:RegionGeoJson) => {     
        let region = new Region(data, name, path);
        callback(new MapController(data, region), region);
    }).fail(() => {
        toast("Region does not exist yet!", true);
    });
}