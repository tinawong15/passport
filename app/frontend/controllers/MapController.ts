import * as L from "leaflet";
import { Region } from "../components/Region";
import {
  RegionGeoJson,
  SubregionGeoJson,
  ColorEnum,
  GameType,
} from "../../models/RegionModel";
import { InfoCard } from "../components/InfoCard";
import { SubregionColor } from "../controllers/SubregionColorController";

/**
 * The MapController class is in charge of controlling user interaction with the map. It takes advantage of LeafletJS to
 * handle the different interactions, and uses the data folder to get region/subregion data.
 */
export class MapController {
  // The URL for the open source World map
  private static readonly ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors';
  private static readonly TILE_LAYER_URL =
    // "https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png";
    // "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";

  // The main Leaflet Map object
  private map: L.Map;

  // The current Region being viewed
  private region: Region;

  // a dictionary containing map options to pass to the main Map object when created
  private options: {
    mapOptions: L.MapOptions; // various control/visual options
    tileLayerOptions: L.TileLayerOptions; // used to add attribution (shows the open source World map)
    geoJsonOptions: L.GeoJSONOptions; // used to map color codes to regions and onEachFeature for onHover and onClick events
  };

  // stores the main GeoJSON layer
  private geoJsonLayer: L.GeoJSON;

  // stores the InfoCard which will display subregion info on hover
  private infocard: InfoCard;

  // True if currently mousing over a subregion, otherwise False
  private mousedIn: boolean;

  // True if the user has zoomed, otherwise False
  private _hasZoomed: boolean;

  // True if the user has dragged, otherwise False
  private _hasDragged: boolean;

  // the callback function to be called when a subreigon is clicked
  private clickCallback: (subregion: SubregionGeoJson) => ColorEnum;

  // the callback function to be called when the draggable card is dropped over a region
  private dragEndCallback: (subregion: SubregionGeoJson) => ColorEnum;

  // the callback function to be called when the draggable card is dragged over a region (training mode only)
  private dragOverCallback: (subregion: SubregionGeoJson) => ColorEnum;

  // the callback function to be called when the draggable card is dragged out a region (training mode only)
  private dragLeaveCallback: (subregion: SubregionGeoJson) => ColorEnum;

  // current gametype that's being played
  private gameType: GameType;

  /**
   * Initializes the Leaflet Map for the given region
   * @param geoJson the geoJSON for the current region being displayed
   * @param region the Region info for the current region being displayed
   */
  public constructor(geoJson: RegionGeoJson, region: Region) {
    this.region = region;
    console.log(this.region.subregions);
    this.options = {
      mapOptions: {
        zoomDelta: 0.5,
        zoomSnap: 0.5,
        wheelPxPerZoomLevel: 1000,
      },
      tileLayerOptions: {
        attribution: MapController.ATTRIBUTION,
      },
      geoJsonOptions: {
        style: {
          color: SubregionColor.getColorCode(SubregionColor.NEUTRAL),
          fillOpacity: 0.4,
        },
        onEachFeature: this.onEachSubregion.bind(this),
      },
    };
    this.buildmap(geoJson);
  }

  /**
   * Initializes this.infocard
   */
  public initInfoCard(): void {
    this.infocard = new InfoCard(this.region);
  }

  /**
   * Destroys this.infocard
   */
  public destroyInfoCard(): void {
    this.infocard = null;
  }

  /**
   * Sets the click callback function to the given function
   * @param callback the callback function to be used
   */
  public setClickCallback(
    callback: (subregion: SubregionGeoJson) => ColorEnum
  ): void {
    this.clickCallback = callback;
  }

  /**
   * Sets the dragend callback function to the given function
   * @param callback the callback function to be used
   */
  public setDragEndCallback(
    callback: (subregion: SubregionGeoJson) => ColorEnum
  ): void {
    this.dragEndCallback = callback;
  }
  /**
   * Sets the dragover callback function to the given function
   * @param callback the callback function to be used
   */
  public setDragOverCallback(
    callback: (subregion: SubregionGeoJson) => ColorEnum
  ): void {
    this.dragOverCallback = callback;
  }

  /**
   * Sets the dragleave callback function to the given function
   * @param callback the callback function to be used
   */
  public setDragLeaveCallback(
    callback: (subregion: SubregionGeoJson) => ColorEnum
  ): void {
    this.dragLeaveCallback = callback;
  }

  /**
   * Disables dragging on the map
   */
  public turnOffDragging(): void {
    this.map.dragging.disable();
  }

  /**
   * Enables dragging on the map
   */
  public turnOnDragging(): void {
    this.map.dragging.enable();
  }

  /**
   * Disables all map zooming
   */
  public turnOffZoom(): void {
    this.map.touchZoom.disable();
    this.map.scrollWheelZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    $(".leaflet-control-zoom").css("visibility", "hidden");
  }

  /**
   * Enables all map zooming
   */
  public turnOnZoom(): void {
    this.map.touchZoom.enable();
    this.map.scrollWheelZoom.enable();
    this.map.boxZoom.enable();
    this.map.keyboard.enable();
    $(".leaflet-control-zoom").css("visibility", "visible");
  }

  /**
   * Resets the map zoom to the default
   */
  public resetZoom(): void {
    this.map.fitBounds(this.geoJsonLayer.getBounds());
  }

  /**
   * Enables zoom tracking
   */
  public trackZoom(): void {
    this.map.on(
      "zoom",
      function () {
        this.map.off("zoom");
        this._hasZoomed = true;
      }.bind(this)
    );
  }

  /**
   * Returns whether or not the user has zoomed (if zoom tracking is enabled)
   * @returns this._hasZoomed
   */
  public hasZoomed(): boolean {
    return this._hasZoomed;
  }

  /**
   * Enables drag tracking
   */
  public trackDrag(): void {
    this.map.on(
      "drag",
      function () {
        this.map.off("drag");
        this._hasDragged = true;
      }.bind(this)
    );
  }

  /**
   * Returns whether or not the user has dragged (if drag tracking is enabled)
   * @returns this._hasDragged
   */
  public hasDragged(): boolean {
    return this._hasDragged;
  }

  /**
   * Updates the color of the given subregion to the given color
   * @param subregion the subregion to set the color of
   * @param color the ColorEnum to set the given subregion to
   */
  public setSubregionColor(
    subregion: SubregionGeoJson,
    color: ColorEnum
  ): void {
    subregion.properties.color = color;
    this.updateStyle();
  }

  public getSubregionById(subregionId: string): SubregionGeoJson {
    return this.region.subregions.get(subregionId);
  }

  /**
   * resets all subregions to their unhovered color state
   * @param subregionToColorMap mapping of subregion to their current ColorEnum
   */
  public resetSubregionColor(
    subregionToColorMap: Map<SubregionGeoJson, ColorEnum>
  ): void {
    for (let [subregion, color] of subregionToColorMap) {
      subregion.properties.color = SubregionColor.removeHover(color);
    }
    this.updateStyle();
  }

  /**
   * Initializes the Leaflet map and sets up the main geoJSON layer.
   * @param geoJson the geoJSON for the current region being displayed
   */
  private buildmap(geoJson: RegionGeoJson): void {
    this.map = L.map("map", this.options.mapOptions).setView(
      [51.505, -0.09],
      1
    );
    this.map.doubleClickZoom.disable();
    L.tileLayer(
      MapController.TILE_LAYER_URL,
      this.options.tileLayerOptions
    ).addTo(this.map);
    this.geoJsonLayer = L.geoJSON(geoJson, this.options.geoJsonOptions).addTo(
      this.map
    );
    this.resetZoom();
    this.updateStyle();
    // this.turnOffDragging();
  }

  /**
   * Updates the map to show the current color property for each subregion, called whenever a subregion color is changed
   */
  private updateStyle(): void {
    this.geoJsonLayer.setStyle((subregion: SubregionGeoJson) => {
      return {
        fillColor: SubregionColor.getColorCode(subregion.properties.color),
      };
    });
  }

  /**
   * The onEachFeature for the map, used to check for hover/click events
   * @param subregion the subregion currently being checked for events
   * @param layer the map layer of the subregion
   */
  private onEachSubregion(subregion: SubregionGeoJson, layer: L.Layer): void {
    // if mouse click on this subregion
    layer.on(
      "click",
      async function (e: L.LeafletMouseEvent) {
        console.log("layer click");
        if (
          !this.mousedIn &&
          subregion.properties.name != this.infocard.getCurrentSubregionName()
        ) {
          this.showInfoCardToTouchInput(subregion, e);
          return;
        }
        this.clickCallback(e.target.feature);
      }.bind(this)
    );
    layer.on(
      "mouseup",
      async function (e: L.LeafletMouseEvent) {
        console.log("layer mouse up");
        if (this.dragEndCallback) {
          this.dragEndCallback(e.target.feature);
        }
      }.bind(this)
    );
    // if mouse is moving over this subregion
    layer.on(
      "mousemove",
      function (e: L.LeafletMouseEvent) {
        if (this.infocard && this.mousedIn) {
          this.infocard.move(e.originalEvent.clientX, e.originalEvent.clientY);
        }
      }.bind(this)
    );
    // if mouse just hovered over this subregion
    layer.on(
      "mouseover",
      function (e: L.LeafletMouseEvent) {
        this.mousedIn = true;
        if (this.gameType === GameType.TEST) {
          this.toggleMouseOver(e.target.feature);
        }
        if (this.infocard) {
          this.infocard.mouseIn(e.target.feature);
        }
        if (this.dragOverCallback) {
          this.dragOverCallback(e.target.feature);
        }
      }.bind(this)
    );
    // if mouse just left this subregion
    layer.on(
      "mouseout",
      function (e: L.LeafletMouseEvent) {
        this.mousedIn = false;
        if (this.gameType === GameType.TEST) {
          this.toggleMouseOver(e.target.feature);
        }
        if (this.infocard) {
          this.infocard.mouseOut();
        }
        if (this.dragLeaveCallback) {
          this.dragLeaveCallback(e.target.feature);
        }
      }.bind(this)
    );
  }

  /**
   * Updates the color of the given subregion to show that it is being moused over
   * @param subregion the subregion that is being moused over
   */
  private toggleMouseOver(subregion: SubregionGeoJson): void {
    subregion.properties.color = SubregionColor.toggleHover(
      subregion.properties.color
    );
    this.updateStyle();
  }

  /**
   * Updates the InfoCard with the given subregion's information and moves it to the current mouse location, called
   * on click event
   * @param subregion the subregion that the mouse was over when this event was fired
   * @param e the Leaflet event
   */
  private showInfoCardToTouchInput(
    subregion: SubregionGeoJson,
    e: L.LeafletMouseEvent
  ) {
    let curr_subregion = this.infocard.getCurrentSubregion();
    if (curr_subregion)
      curr_subregion.properties.color = SubregionColor.removeHover(
        curr_subregion.properties.color
      );

    this.infocard.mouseOut();
    this.infocard.mouseIn(e.target.feature);
    this.infocard.move(e.originalEvent.clientX, e.originalEvent.clientY);
    this.map.off("movestart");
    this.map.off("zoomstart");

    this.map.on(
      "zoomstart",
      function () {
        this.infocard.mouseOut();
        this.map.off("zoomstart");
        subregion.properties.color = SubregionColor.removeHover(
          subregion.properties.color
        );
        this.updateStyle();
      }.bind(this)
    );
    this.map.on(
      "movestart",
      function () {
        this.infocard.mouseOut();
        this.map.off("movestart");
        subregion.properties.color = SubregionColor.removeHover(
          subregion.properties.color
        );
        this.updateStyle();
      }.bind(this)
    );

    subregion.properties.color = SubregionColor.addHover(
      subregion.properties.color
    );
    this.updateStyle();
  }

  public setGameType(gameType: GameType): void {
    this.gameType = gameType;
  }
}
