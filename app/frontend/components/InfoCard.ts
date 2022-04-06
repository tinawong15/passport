import { SubregionGeoJson } from "../../models/RegionModel";
import { UserManager } from '../managers/UserManager'
import { Region } from "./Region";

/**
 * InfoCard stores information to be displayed onHover of a subregion, and other various
 * information
 */
export class InfoCard {
    // the parent region of the current region
    private parentRegion: Region;

    // ????????
    private rootElement: JQuery;

    // the name of the current region
    private name: JQuery;

    // the leader of the current region
    private leader: JQuery;

    // the capital of the current region
    private capital: JQuery;

    // the flag of the current region
    private flag: JQuery;

    // ?????????
    private rank: JQuery;

    // true if the InfoCard is visible, otherwise false
    private visible: boolean;

    // ????????
    private currentSubregion: SubregionGeoJson;

    /**
     * constructs an InfoCard object for the parent region
     * @param parentRegion the parent region for the current map being displayed
     */
    public constructor(parentRegion: Region) {
        this.parentRegion = parentRegion;

        this.rootElement = $('#hover-info');
        this.name = $('#info-name');
        this.capital = $('#info-capital');
        this.leader = $('#info-leader');
        this.flag = $('#info-flag');
        this.rank = $('.user-rank');

        this.visible = false;
        this.currentSubregion = null;
    }

    /**
     * moves the InfoCard to the new mouse location and displays it accordingly
     * @param x current x coordinate
     * @param y current y coordinate
     */
    public move(x:number, y:number):void {
        let width = this.rootElement.width();
        let height = this.rootElement.height();
        if (x + 35 + width <= window.innerWidth) {
            this.rootElement.css('left', x + 15);
        }
        else {
            this.rootElement.css('left', x - width - 30);
        }
        if (y + 35 + height <= window.innerHeight) {
            this.rootElement.css('top', y + 15);
        }
        else {
            this.rootElement.css('top', y - height - 30);
        }
        this.rootElement.show();
    }

    /**
     * updates this InfoCard to store information on the current subregion being hovered
     * @param subregion the subregion being hovered
     */
    public mouseIn(subregion: SubregionGeoJson):void {
        this.name.text(subregion.properties.name);

        let rank:any = null// = UserManager.get().user.gameData.getData(this.parentRegion.getPath() + '/' + subregion.properties.name).getRank();
        if (rank == null)
            this.rank.parent().hide();
        else {
            this.rank.parent().show();
            this.rank.text(rank);
        }

        if (this.parentRegion.properties.subregions_have_capitals) {
            this.capital.text(subregion.properties.capital);
        } 
        else {
            this.capital.parent().hide();
        }
        if (this.parentRegion.properties.subregions_have_leaders) {
            this.leader.text(subregion.properties.leader);
        } 
        else {
            this.leader.parent().hide();
        }
        if (this.parentRegion.properties.subregions_have_flags) {
            this.flag.attr('src', '/img/' + this.parentRegion.path + '/' + subregion.properties.name + ' Flag.png');
        }
        this.visible = true;
        this.currentSubregion = subregion;
    }

    /**
     * hides the InfoCard, called when the current subregion is no longer hovered over
     */
    public mouseOut():void {
        this.rootElement.hide();
        this.visible = false;
        this.currentSubregion = null;
    }

    /**
     * Checks whether or not this InfoCard is currently being shown to the user
     * @returns True if this InfoCard is current visible, otherwise False
     */
    public isVisible():boolean {
        return this.visible;
    }

    /**
     * Returns the subregion whose information is currently shown
     * @returns the current subregion being hovered
     */
    public getCurrentSubregion(): SubregionGeoJson {
        return this.currentSubregion;
    }
    
    /**
     * Returns the name of the current subregion whose information is currently shown
     * @returns the name of the subregion being hovered
     */
    public getCurrentSubregionName(): string {
        return this.currentSubregion ? this.currentSubregion.properties.name : null;
    }
}