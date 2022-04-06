import dir = require('node-dir');
import path = require('path');
import jsonfile = require('jsonfile');
import { RegionGeoJson } from '../../models/RegionModel';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

/**
 * returns a useable directory regex to check if a given path will lead to the
 * data directory
 */
function getDirectoryRegex():RegExp {
    if (path.sep == '/') return /app\/data\/((.+)\/)*(.+)\.json$/;
    else return /app\\data\\((.+)\\)*(.+)\.json$/;
}

/**
 * Playable class follows a Singleton data structure, it goes through the data directory
 * and retrieves the region data
 */
export class Playable {
    // This could probably be a database
    private static playable:Playable;

    /**
     * returns the main Playable object, if the object doesn't exist yet it will create
     * and return the main Playable object
     */
    public static get():Playable {
        if (!this.playable)
            this.playable = new Playable();
        return this.playable;
    }
    // directory structure:
    // app/data/The World/Africa/Algeria/Algeria.json
    // Regex to extract The World/Africa and Algeria
    private static readonly directory_regex = getDirectoryRegex();

    // the relative path to the data directory from here
    private static readonly data_dir = path.join(__dirname, '..', '..', 'data');

    // the regions from the data json
    private playable: string[];

    // maps regionPath to the region name and region json
    private regions: {[regionPath:string]:{
        name:string,
        json:string
    }}

    /**
     * constructs a Playable object, stores the paths to the region json
     */
    private constructor() {
        this.regions = {};
        dir.readFiles(
            path.join(Playable.data_dir),
            { match: /.*.json$/ },
            function (err:any, content:any, next:()=>any) {
                if (err) throw err;
                next();
            },
            function (err:any, files:string[]){
                if (err) throw err;
                for (let file of files) {
                    let matches = Playable.directory_regex.exec(file);
                    if (matches && matches[1]) {
                        let region = matches[1].slice(0, matches[1].length - 1);
                        if (path.sep == '\\') region = region.replace(/\\/g, '/');
                        this.regions[region] = {
                            name: matches[3],
                            json: matches[0]
                        };
                    } 
                }
                this.playable = Object.keys(this.regions).sort();
                jsonfile.writeFile(path.join(Playable.data_dir, 'playable.json'), this.playable);
            }.bind(this)
        );
    }

    /**
     * checks if the region path exists in the data json
     * @param regionPath region path to search for
     */
    public has(regionPath:string):boolean {
        return regionPath in this.regions;
    }

    /**
     * returns the name of the region given the region path
     * @param regionPath region path to find the name of
     */
    public getName(regionPath:string):string {
        return this.regions[regionPath].name;
    }

    // Ideally this would be a database call, with GeoJSONs in a DB
    /**
     * returns the RegionGeoJSON of the given region path
     * @param regionPath the region path to find the GeoJSON data for
     */
    public getJSON(regionPath:string):RegionGeoJson {
        if (regionPath in this.regions)
            return jsonfile.readFileSync(this.regions[regionPath].json);
        return null;
    }

    /**
     * returns the list of playable regions
     */
    public getPlayable():string[] {
        return this.playable;
    }
}
