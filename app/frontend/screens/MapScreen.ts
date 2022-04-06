import { ScreenManager } from "../managers/ScreenManager";
import { Region } from "../components/Region";
import { SubregionGeoJson, ColorEnum } from "../../models/RegionModel";
import { ScreenEnum } from "../managers/ScreenManager";
import { loadGeoJSON } from "../components/JsonLoader";
import { MapController } from "../controllers/MapController";
import { Screen } from "./Screen";
import { toast } from "../components/toast";

/**
 * Any screen that uses maps
 */
export abstract class MapScreen extends Screen {
  protected region: Region;
  protected mapController: MapController;
  private hierarchy: Array<[string, string]>;
  private breadcrumbs: JQuery;

  public constructor(name: ScreenEnum, queries: URLSearchParams) {
    super(name, false, queries);
    let hierarchy =
      this.queries && this.queries.has("region")
        ? this.queries.get("region").split("/")
        : ["The World"];
    this.hierarchy = [];
    for (let i = 0; i < hierarchy.length; i++) {
      let region = hierarchy[i];
      let fullPath = "";

      for (let j = 0; j <= i; j++) {
        fullPath += hierarchy[j] + "/";
      }
      fullPath = fullPath.slice(0, -1); // cut off last slash

      this.hierarchy.push([this.toUpperCase(region), fullPath]);
    }
  }

  protected dataLoaded(mapController: MapController, region: Region): void {
    this.mapController = mapController;
    this.region = region;
    this.mapController.setClickCallback(this.subregionClick.bind(this));
    this.attachHandler(
      document,
      "keypress",
      function (e: JQueryKeyEventObject) {
        if (e.key == " ") this.mapController.resetZoom();
      }.bind(this)
    );

    ScreenManager.get().passRegionToOverlay(region);
  }

  protected abstract subregionClick(subregion: SubregionGeoJson): void;

  protected abstract subregionDragEnd(subregion: SubregionGeoJson): void;

  protected abstract subregionDragOver(subregion: SubregionGeoJson): void;

  protected abstract subregionDragLeave(subregion: SubregionGeoJson): void;

  private toUpperCase(str: string): string {
    var words = str.replace(/-/g, " ").toLowerCase().split(" ");

    for (var i = 0; i < words.length; i++) {
      var letters = words[i].split("");
      letters[0] = letters[0].toUpperCase();
      words[i] = letters.join("");
    }
    return words.join(" ");
  }

  public ready(): void {
    super.ready();

    let regionName =
      this.queries && this.queries.has("region")
        ? this.queries.get("region")
        : "The World";
    loadGeoJSON(this.name, regionName, this.dataLoaded.bind(this));

    this.breadcrumbs = $("#nav-breadcrumbs");

    $(".new-breadcrumb").remove();

    // set breadcrumbs
    for (let [key, item] of this.hierarchy) {
      let breadcrumb = $("#breadcrumb-template")
        .clone()
        .removeClass("hidden-breadcrumb")
        .attr("id", "")
        .addClass("new-breadcrumb");
      breadcrumb.find("a").attr("href", `/map?region=${item}`).text(key);

      this.breadcrumbs.append(breadcrumb);
    }

    $(".tooltipped").tooltip();
  }

  public error(): void {
    toast("Region not yet playable", true);
  }
}
