import { MapScreen } from "./MapScreen";
import { toast } from "../components/toast";
import { UserManager } from "../managers/UserManager";
import { MapController } from "../controllers/MapController";
import { Region } from "../components/Region";
import { SubregionGeoJson, ColorEnum } from "../../models/RegionModel";
import { ScreenManager } from "../managers/ScreenManager";
import { AudioManager, MusicId, SoundId } from "../managers/AudioManager";

export class NavScreen extends MapScreen {
  private playable: Object;

  constructor(queries: URLSearchParams) {
    super(ScreenManager.NAV, queries);
    this.playable = {};
  }

  protected dataLoaded(mapController: MapController, region: Region): void {
    super.dataLoaded(mapController, region);
    mapController.initInfoCard();

    $("#capital-link").show();
    $("#leader-link").show();
    $("#flag-link").show();

    var regionData: any = null;

    if (false /** User manager stuff */) {
      $("#capital-link").addClass("disabled").attr("href", "#");
      $("#leader-link").addClass("disabled").attr("href", "#");
      $("#flag-link").addClass("disabled").attr("href", "#");
    }

    if (!this.region.properties.subregions_have_capitals) {
      $("#capital-link").hide();
      $("#capital-mode-radio").prop("disabled", true);
    }
    if (!this.region.properties.subregions_have_leaders) {
      $("#leader-link").hide();
      $("#leader-mode-radio").prop("disabled", true);
    }
    if (!this.region.properties.subregions_have_flags) {
      $("#flag-link").hide();
      $("#flag-mode-radio").prop("disabled", true);
    }
    if (!this.region.properties.subregions_have_landmarks) {
      $("#landmarks-link").hide();
      $("#landmarks-mode-radio").prop("disabled", true);
    }

    this.attachHandler(".game-mode-select.disabled", "click", function (e) {
      toast("Mode not playable until you complete Regions mode", true);
    });
  }

  protected subregionClick(subregion: SubregionGeoJson): void {
    let newQueries = new URLSearchParams();
    newQueries.set(
      "region",
      `${this.region.path}/${subregion.properties.name}`
    );
    ScreenManager.get().switchScreens(ScreenManager.NAV, newQueries);
    AudioManager.get().playRandomSound(
      SoundId.AIRPLANE_LAND,
      SoundId.AIRPLANE_PASS,
      SoundId.TRAIN_PASS,
      SoundId.TRAIN_WHISTLE,
      SoundId.CAR_START
    );
  }

  protected subregionDragEnd(subregion: SubregionGeoJson): void {}

  protected subregionDragLeave(subregion: SubregionGeoJson): void {}

  protected subregionDragOver(subregion: SubregionGeoJson): void {}

  public ready(): void {
    super.ready();
    AudioManager.get().playMusic(MusicId.NAV);

    // load data - doesn't matter to search if its not loaded yet
    $.get(
      "/data/playable",
      function (data: Object) {
        if (data.hasOwnProperty(this.queries.get("region"))) {
          for (let region of data[this.queries.get("region")]) {
            if (this.region && this.region.subregionsHaveFlags())
              this.playable[
                region
              ] = `/img/${this.region.path}/${region} Flag.png`;
            else this.playable[region] = null;
          }
        }
        if ($.isEmptyObject(this.playable)) {
          $("#search-region").hide();
          return;
        }
        ($("#regions-search") as any).autocomplete({
          data: this.playable,
          limit: 20,
          onAutocomplete(val: string) {
            // This is never being called :(
            this.regionSearchSubmit(val);
          },
          minLength: 1,
        });

        this.attachHandler(
          "#submit-btn",
          "click",
          function () {
            this.regionSearchSubmit($("#regions-search").val());
          }.bind(this)
        );
      }.bind(this)
    );

    $("#regions-search").keypress(
      function (e: JQueryEventObject) {
        let newRegion = $(e.target).val();
        if (e.key == "Enter" && this.playable.hasOwnProperty(newRegion)) {
          this.regionSearchSubmit(newRegion);
        }
      }.bind(this)
    );

    ScreenManager.get().switchScreens(ScreenManager.PRENAV, this.queries);

    if (this.region) {
      $("#name-link").attr(
        "data-tooltip",
        this.region.properties.subregion_type
      );
      $(".tooltipped").tooltip();
    } else {
      Object.defineProperty(this, "region", {
        configurable: true,
        get: function () {
          return this._region;
        },
        set: function (region: Region) {
          this._region = region;
          $("#name-link").attr(
            "data-tooltip",
            this.region.properties.subregion_type
          );
          $(".tooltipped").tooltip();
        },
      });
    }
  }

  private regionSearchSubmit(newRegion: string): void {
    if (!this.playable.hasOwnProperty(newRegion)) {
      toast("Region not playable", true);
      return;
    }
    let newQueries = new URLSearchParams();
    newQueries.set("region", `${this.region.path}/${newRegion}`);
    ScreenManager.get().switchScreens(ScreenManager.NAV, newQueries);
  }
}
