import { MapScreen } from "./MapScreen";
import { UserManager } from "../managers/UserManager";
import { toast } from "../components/toast";
import { MapController } from "../controllers/MapController";
import {
  SubregionGeoJson,
  GameplayMode,
  ColorEnum,
  GameType,
} from "../../models/RegionModel";
import { SubregionColor } from "../controllers/SubregionColorController";
import { Region } from "../components/Region";
import { GameplayManager } from "../managers/GameplayManager";
import { ScreenManager } from "../managers/ScreenManager";
import { AudioManager, MusicId, SoundId } from "../managers/AudioManager";

export class GameplayScreen extends MapScreen {
  private mode: GameplayMode;
  private type: GameType;
  private oneToOne: boolean; // Answer -> Subregion is one to one
  private incorrectSubregions: Map<SubregionGeoJson, ColorEnum>;
  private correctSubregions: Map<SubregionGeoJson, ColorEnum>;

  public constructor(queries: URLSearchParams) {
    super(ScreenManager.GAMEPLAY, queries);

    this.mode = <GameplayMode>this.queries.get("mode");
    this.type = <GameType>this.queries.get("type");
    if ([GameplayMode.LANDMARKS].includes(this.mode)) this.oneToOne = false;
    else this.oneToOne = true;
    this.incorrectSubregions = new Map();
    this.correctSubregions = new Map();
  }

  public ready(): void {
    super.ready();
    ScreenManager.get().switchScreens(ScreenManager.PREGAME, this.queries);
    AudioManager.get().stopMusic(MusicId.NAV);
  }

  public onLeave(): void {
    super.onLeave();
    GameplayManager.dispose();
  }

  public getCorrectSubregion(): void {
    console.log("getCorrectSubregion");
    $.ajax({
      method: "POST",
      url: "/api/correctSubRegion",
      data: {
        cardId: GameplayManager.get().getTopCardId(),
      },
      success: function (data: any, status: string, xhr: JQueryXHR) {
        console.log("success!");
        console.log(data);
        let subregion = this.mapController.getSubregionById(data.subregionId);
        this.mapController.setSubregionColor(
          subregion,
          SubregionColor.CORRECT_HOVER
        );
      }.bind(this),
      error(xhr, status, err) {
        toast("Server Error! Game might be corrupt", true);
      },
    });
  }

  protected dataLoaded(mapController: MapController, region: Region): void {
    super.dataLoaded(mapController, region);

    GameplayManager.create(
      parseInt($("#card-area").attr("data-len")),
      "", //UserManager.get().user.gameData.getData(this.queries.get('region')).getScore(this.mode)
      this.mode
    );
    this.attachHandler(
      document,
      "keypress",
      function (e: JQueryKeyEventObject) {
        if (e.key == "s") this.skip();
      }.bind(this)
    );
    this.attachHandler(
      "#playpause",
      "click",
      function () {
        GameplayManager.get().pause();
        this.currentOverlay = ScreenManager.get().switchScreens(
          ScreenManager.PAUSE,
          this.queries
        );
        this.currentOverlay.dataLoaded(this.region);
      }.bind(this)
    );
    this.attachHandler("#skip", "click", this.skip.bind(this));
    this.attachHandler(
      "#reset-zoom",
      "click",
      function () {
        this.mapController.resetZoom();
      }.bind(this)
    );
    GameplayManager.get().setGameType(this.type);
    this.mapController.setDragEndCallback(this.subregionDragEnd.bind(this));
    this.mapController.setDragOverCallback(this.subregionDragOver.bind(this));
    this.mapController.setDragLeaveCallback(this.subregionDragLeave.bind(this));

    if (this.type === GameType.LEARN) {
      this.getCorrectSubregion();
    }
  }

  protected subregionClick(subregion: SubregionGeoJson): void {
    console.log("this.type");
    console.log(this.type);
    if (this.type === GameType.TEST) {
      console.log("inside if statement");
      console.log(this.type);
      if (
        this.incorrectSubregions.has(subregion) ||
        this.correctSubregions.has(subregion)
      )
        return;
      GameplayManager.get().check(
        subregion.properties.id,
        function (correct: boolean) {
          if (correct) {
            AudioManager.get().playSound(SoundId.CLICK);
            if (this.incorrectSubregions.size > 0) {
              this.mapController.resetSubregionColor(this.incorrectSubregions);
              this.incorrectSubregions.clear();
            }
            if (!this.oneToOne) {
              this.correctSubregions.delete(subregion);
              let subregionFader = new Map<SubregionGeoJson, ColorEnum>([
                [subregion, subregion.properties.color],
              ]);
              setTimeout(() => {
                this.mapController.resetSubregionColor(subregionFader);
              }, 1000);
            } else {
              this.correctSubregions.set(subregion, subregion.properties.color);
            }
            this.mapController.setSubregionColor(
              subregion,
              SubregionColor.CORRECT
            );
          } else {
            AudioManager.get().playRandomSound(
              SoundId.ENGINE_FAIL,
              SoundId.ENGINE_FAIL_ALT
            );
            this.incorrectSubregions.set(subregion, subregion.properties.color);
            this.mapController.setSubregionColor(
              subregion,
              SubregionColor.INCORRECT
            );
          }
        }.bind(this)
      );
    }
  }

  protected subregionDragEnd(subregion: SubregionGeoJson): void {
    if (this.type !== GameType.TEST && GameplayManager.get().isDragging()) {
      console.log("subregionDragEnd");
      if (
        this.incorrectSubregions.has(subregion) ||
        this.correctSubregions.has(subregion)
      )
        return;
      GameplayManager.get().check(
        subregion.properties.id,
        function (correct: boolean) {
          if (correct) {
            while (GameplayManager.get().getIsAnimating()) {
              console.log("isAnimating");
            }
            AudioManager.get().playSound(SoundId.CLICK);
            if (this.incorrectSubregions.size > 0) {
              this.mapController.resetSubregionColor(this.incorrectSubregions);
              this.incorrectSubregions.clear();
            }
            if (!this.oneToOne) {
              this.correctSubregions.delete(subregion);
              let subregionFader = new Map<SubregionGeoJson, ColorEnum>([
                [subregion, subregion.properties.color],
              ]);
              setTimeout(() => {
                this.mapController.resetSubregionColor(subregionFader);
              }, 1000);
            } else {
              this.correctSubregions.set(subregion, subregion.properties.color);
            }
            this.mapController.setSubregionColor(
              subregion,
              SubregionColor.CORRECT
            );
            if (this.type === GameType.LEARN) {
              this.getCorrectSubregion();
            }
          } else {
            AudioManager.get().playRandomSound(
              SoundId.ENGINE_FAIL,
              SoundId.ENGINE_FAIL_ALT
            );
            this.incorrectSubregions.set(subregion, subregion.properties.color);
            this.mapController.setSubregionColor(
              subregion,
              SubregionColor.INCORRECT
            );
          }
        }.bind(this)
      );
    }
  }

  protected subregionDragOver(subregion: SubregionGeoJson): void {
    if (
      (this.type === GameType.TRAIN || this.type == GameType.LEARN) &&
      GameplayManager.get().isDragging()
    ) {
      if (
        this.incorrectSubregions.has(subregion) ||
        this.correctSubregions.has(subregion)
      )
        return;
      GameplayManager.get().verify(
        subregion.properties.id,
        function (correct: boolean) {
          if (correct) {
            GameplayManager.get().setDraggableIsCorrectTrue();
            console.log("dragover correct!");
            if (this.type === GameType.TRAIN) {
              this.mapController.setSubregionColor(
                subregion,
                SubregionColor.CORRECT_HOVER
              );
            }
          }
        }.bind(this)
      );
    }
  }

  protected subregionDragLeave(subregion: SubregionGeoJson): void {
    if (
      (this.type === GameType.TRAIN || this.type == GameType.LEARN) &&
      GameplayManager.get().isDragging()
    ) {
      if (
        this.incorrectSubregions.has(subregion) ||
        this.correctSubregions.has(subregion)
      )
        return;
      GameplayManager.get().verify(
        subregion.properties.id,
        function (correct: boolean) {
          if (correct) {
            GameplayManager.get().setDraggableIsCorrectFalse();
            console.log("dragleave correct!");
            if (this.type === GameType.TRAIN) {
              this.mapController.setSubregionColor(
                subregion,
                SubregionColor.NEUTRAL
              );
            }
          }
        }.bind(this)
      );
    }
  }

  public highlightCorrectSubregion() {
    let subregion = this.mapController.getSubregionById(
      GameplayManager.get().correctSubregion
    );
    this.mapController.setSubregionColor(subregion, SubregionColor.CORRECT);
  }

  private skip(): void {
    AudioManager.get().playSound(SoundId.SWOOSH);
    GameplayManager.get().skip();
    if (this.incorrectSubregions.size > 0) {
      this.mapController.resetSubregionColor(this.incorrectSubregions);
      this.incorrectSubregions.clear();
    }
  }
}
