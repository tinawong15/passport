import { Region } from "../components/Region";
import { SubregionColor } from "../controllers/SubregionColorController";
import {
  SubregionGeoJson,
  ColorEnum,
  GameplayMode,
} from "../../models/RegionModel";
import { ScreenManager } from "../managers/ScreenManager";
import { MapController } from "../controllers/MapController";
import { MapScreen } from "./MapScreen";

class TutorialStep {
  private text: string;
  private neighbor_elem_id: string;
  private neighbor_direction?: "top" | "left" | "bottom" | "right";
  private neighbor_align?: "top" | "left" | "bottom" | "right";
  private click_elem_id?: string;
  public ok_advances_tutorial: boolean;
  private init: () => void;
  private clean: () => void;
  private event_handler?: (e: JQueryEventObject) => void;
  private align() {
    if (this.neighbor_elem_id == null) {
      let top =
        window.innerHeight / 2 - TutorialStep.tutorialPostcard.height() / 2;
      let left =
        window.innerWidth / 2 - TutorialStep.tutorialPostcard.width() / 2;
      TutorialStep.tutorialPostcard.animate(
        {
          top: top,
          left: left,
        },
        "fast"
      );
    } else {
      let neighbor = $(this.neighbor_elem_id);
      let neighbor_offset = $(this.neighbor_elem_id).offset();
      let position_axis = null;
      let position = null;
      switch (this.neighbor_direction) {
        case "top":
          position_axis = "top";
          position = neighbor_offset.top + neighbor.height();
          break;
        case "bottom":
          position_axis = "top";
          position =
            neighbor_offset.top - TutorialStep.tutorialPostcard.height();
          break;
        case "left":
          position_axis = "left";
          position = neighbor_offset.left + neighbor.width();
          break;
        case "right":
          position_axis = "left";
          position =
            neighbor_offset.left - TutorialStep.tutorialPostcard.width();
          break;
      }
      let align_axis = null;
      let align = null;
      switch (this.neighbor_align) {
        case "top":
          align_axis = "top";
          align = neighbor_offset.top;
          break;
        case "bottom":
          align_axis = "top";
          align =
            neighbor_offset.top +
            neighbor.height() -
            TutorialStep.tutorialPostcard.height();
          break;
        case "left":
          align_axis = "left";
          align = neighbor_offset.left;
          break;
        case "right":
          align_axis = "left";
          align =
            neighbor_offset.left +
            neighbor.width() -
            TutorialStep.tutorialPostcard.width();
          break;
      }
      let css = {
        top: "",
        left: "",
      };
      //@ts-ignore
      css[position_axis] = position;
      //@ts-ignore
      css[align_axis] = align;
      TutorialStep.tutorialPostcard.animate(css, "fast");
    }
  }

  public constructor(
    text: string,
    neighbor_elem_id: string,
    init: () => void,
    clean: () => void,
    neighbor_direction?: "top" | "left" | "bottom" | "right",
    neighbor_align?: "top" | "left" | "bottom" | "right",
    click_elem_id?: string
  ) {
    this.text = text;
    this.neighbor_elem_id = neighbor_elem_id;
    this.init = init;
    this.clean = clean;
    this.neighbor_direction = neighbor_direction;
    this.neighbor_align = neighbor_align;
    this.click_elem_id = click_elem_id;
    this.ok_advances_tutorial = !click_elem_id;
  }

  private static parentScreen: TutorialScreen;
  private static tutorialPostcard: JQuery;
  private static tutorialText: JQuery;
  private static advanceTutorial: JQuery;
  private static stepIndex: number;
  private static temp_text: string;
  private static readonly steps: TutorialStep[] = [
    new TutorialStep(
      "    Welcome To The Regio Vinco Tutorial. Press OK to continue tutorial",
      null,
      function () {},
      function () {}
    ),
    new TutorialStep(
      "    This is the Map Screen. Hover over a continent with your mouse to get information on it! (Tap once if on a touch screen)",
      "#rv-nav",
      function () {
        TutorialStep.parentScreen.getMapController().initInfoCard();
      },
      function () {
        TutorialStep.parentScreen.getMapController().destroyInfoCard();
      },
      "top",
      "left"
    ),
    new TutorialStep(
      "    You can manipulate the map to your liking. Zoom by scrolling, clicking the zoom buttons (in the top left), or pinching the touch screen",
      ".leaflet-control-zoom",
      function () {
        this.ok_advances_tutorial = false;
        TutorialStep.parentScreen.getMapController().turnOnZoom();
        TutorialStep.parentScreen.getMapController().trackZoom();
        let text = this.text;
        this.event_handler = function (e: JQueryEventObject) {
          if (TutorialStep.parentScreen.getMapController().hasZoomed()) {
            TutorialStep.nextStep();
          } else {
            TutorialStep.tutorialText.html(text + "<br/>Did you zoom yet?");
          }
        };
        TutorialStep.advanceTutorial.on("click", this.event_handler);
      },
      function () {
        TutorialStep.advanceTutorial.off("click", this.event_handler);
        TutorialStep.parentScreen.getMapController().turnOffZoom();
      },
      "left",
      "top"
    ),
    new TutorialStep(
      "    You can manipulate the map in more ways than 1, try dragging the map by holding a click and moving the mouse (or holding a tap if on a touchscreen)",
      "#rv-nav",
      function () {
        this.ok_advances_tutorial = false;
        TutorialStep.parentScreen.getMapController().turnOnDragging();
        TutorialStep.parentScreen.getMapController().trackDrag();
        let text = this.text;
        this.event_handler = function (e: JQueryEventObject) {
          if (TutorialStep.parentScreen.getMapController().hasDragged()) {
            TutorialStep.nextStep();
          } else {
            TutorialStep.tutorialText.html(
              text + "<br/>Did you drag the map yet?"
            );
          }
        };
        TutorialStep.advanceTutorial.on("click", this.event_handler);
      },
      function () {
        TutorialStep.advanceTutorial.off("click", this.event_handler);
        TutorialStep.parentScreen.getMapController().turnOnZoom();
      },
      "top",
      "left"
    ),
    new TutorialStep(
      "    Clicking on a region in the map, should bring you to that region's map. Try clicking on a continent",
      "#rv-nav",
      function () {
        this.ok_advances_tutorial = false;
        TutorialStep.advanceTutorial.prop("disabled", true);
        TutorialStep.parentScreen.checkClickHelper = function (
          subregion: SubregionGeoJson
        ) {
          TutorialStep.temp_text = subregion.properties.name;
          TutorialStep.nextStep();
          return SubregionColor.NEUTRAL;
        };
      },
      function () {
        TutorialStep.parentScreen.resetCheckClickHelper();
      },
      "top",
      "left"
    ),
    new TutorialStep(
      "    Sorry! While normally, clicking on PLACEHOLDER would bring you to the map of PLACEHOLDER, for the tutorial, you need to stay here. Click OK to continue the tutorial",
      null,
      function () {
        this.text = this.text.replace(/PLACEHOLDER/g, TutorialStep.temp_text);
        TutorialStep.tutorialText.text(this.text);
      },
      function () {
        TutorialStep.temp_text = null;
      }
    ),
    new TutorialStep(
      "    These are the buttons to play the different gamemodes of Regio Vinco! Click one to see what it does.",
      "#map-message",
      function () {
        this.ok_advances_tutorial = false;
        TutorialStep.advanceTutorial.prop("disabled", true);
        $("#navhud").show();
        let gamemodes = {
          regions: false,
          capitals: false,
          leaders: false,
          flags: false,
        };
        let generateHTML = function (text: string): string {
          let notClicked = [];
          for (let gamemode in gamemodes) {
            if (!gamemodes[gamemode]) {
              notClicked.push(gamemode);
            }
          }
          if (notClicked.length == 0) return text;
          text += "<br/><br/>    Try clicking on the <b>";
          if (notClicked.length == 1)
            return text + notClicked.pop() + "</b> gamemode.";
          let last = notClicked.pop();
          return (
            text +
            notClicked.join("</b> , <b>") +
            "</b> and <b>" +
            last +
            "</b> gamemodes."
          );
        };
        let checkComplete = function () {
          for (let gamemode in gamemodes) {
            if (!gamemodes[gamemode]) return;
          }
          TutorialStep.advanceTutorial.prop("disabled", false);
          this.ok_advances_tutorial = true;
        }.bind(this);
        $("#name-link").click(
          function () {
            gamemodes.regions = true;
            TutorialStep.tutorialText.html(
              generateHTML(
                '<i class="mdi mdi-earth"></i> Name the Region. The World is divided into Continents, which divide into Countries, etc. You just need to know the names of the first division!'
              )
            );
            checkComplete();
          }.bind(this)
        );
        $("#capital-link").click(
          function () {
            gamemodes.capitals = true;
            TutorialStep.tutorialText.html(
              generateHTML(
                '<i class="mdi mdi-bank"></i> Governments have to govern from somewhere, and that somewhere is the Capital. Do you know the names of where they sit?'
              )
            );
            checkComplete();
          }.bind(this)
        );
        $("#leader-link").click(
          function () {
            gamemodes.leaders = true;
            TutorialStep.tutorialText.html(
              generateHTML(
                '<i class="mdi mdi-crown"></i> From Figurehead to Dictator and everything in between, if a region has a single person "in charge," the Leader gamemode is where you\'re asked who they are'
              )
            );
            checkComplete();
          }.bind(this)
        );
        $("#flag-link").click(
          function () {
            gamemodes.flags = true;
            TutorialStep.tutorialText.html(
              generateHTML(
                "<i class=\"mdi mdi-flag\"></i> Do you know what the Star Spangled Banner, the Union Jack, the Tricolor, or the Circle of the Sun represent? It's ok if you don't, since all you need to do here is match a picture to place"
              )
            );
            checkComplete();
          }.bind(this)
        );
      },
      function () {
        $(".game-mode-select").off("click");
        $("#capital-link").hide();
        $("#leader-link").hide();
        $("#flag-link").hide();
      },
      "bottom",
      "left"
    ),
    new TutorialStep(
      "    Unfortunately, the Continents of the World don't have capitals, leaders, or flags (no, 🇪🇺 doesn't count). Click on the Regions gamemode to continue",
      "#map-message",
      function () {},
      function () {},
      "bottom",
      "left",
      "#name-link"
    ),
    new TutorialStep(
      "    This is the gameplay screen. All of the gamemodes look like this, and differ by the content of the cards",
      null,
      function () {
        $("#navhud").hide();
        $("#gameplayhud").show();
        $("#playpause-button").removeClass("mdi-play").addClass("mdi-pause");
        $("#remaining").text("8");
        $("#score").text("-");
        $("#high-score").text("-");
        let time = 0;
        setInterval(function () {
          let minutes = Math.floor(time / 60);
          let seconds: any = time % 60;
          if (seconds < 10) seconds = "0" + seconds;
          $("#time").text(minutes + ":" + seconds);
          time++;
        }, 1000);
      },
      function () {}
    ),
    new TutorialStep(
      "    These are gameplay controls. From left to right, we have the pause button, skip button, and reset zoom button. First, reset the zoom by pressing the button, or hitting SPACE",
      "#gameplay-buttons",
      function () {
        let mc = TutorialStep.parentScreen.getMapController();
        $("#reset-zoom").click(mc.resetZoom.bind(mc));
        this.event_handler = function (e: JQueryEventObject) {
          if ((e.key = " ")) {
            TutorialStep.nextStep();
          }
        };
        $(document).on("keypress", this.event_handler);
      },
      function () {
        $(document).off("keypress", this.event_handler);
      },
      "bottom",
      "left",
      "#reset-zoom"
    ),
    new TutorialStep(
      '    Now press the skip button, or hit the "s" key',
      "#gameplay-buttons",
      function () {
        let cs: any; //TutorialStep.parentScreen.cardstack;
        $("#skip").click(cs.skip.bind(cs));
        this.event_handler = function (e: JQueryEventObject) {
          if ((e.key = "s")) {
            cs.skip();
            TutorialStep.nextStep();
          }
        };
        $(document).on("keypress", this.event_handler);
      },
      function () {
        $("#skip").off("click");
        $(document).off("keypress", this.event_handler);
        $("#remaining").text("7");
        $("#incorrect").text("1");
      },
      "bottom",
      "left",
      "#skip"
    ),
    new TutorialStep(
      "    Whoa, where did that card go? I guess you skipped it. This is the Postcard Stack. In the Region Gamemode, you're task is to click the corresponding region in the map, based on the top green card (or you can skip). In other gamemodes, the capital or leader might be listed. In this case, click PLACEHOLDER.",
      "#card-area",
      function () {
        this.ok_advances_tutorial = false;
        TutorialStep.advanceTutorial.prop("disabled", true);
        let topCardContent = "g"; //TutorialStep.parentScreen.cardstack.getTopCardContent()
        this.text = this.text.replace(/PLACEHOLDER/g, topCardContent);
        TutorialStep.tutorialText.text(this.text);
        let incorrect = 1;
        TutorialStep.parentScreen.checkClickHelper = function (
          subregion: SubregionGeoJson
        ) {
          if (topCardContent == subregion.properties.name) {
            $("#correct").text(1);
            TutorialStep.nextStep();
            return SubregionColor.CORRECT;
          } else {
            $("#incorrect").text(++incorrect);
            TutorialStep.tutorialText.html(
              this.text +
                "<br/>That was " +
                subregion.properties.name +
                ", not " +
                topCardContent
            );
            return SubregionColor.INCORRECT;
          }
        }.bind(this);
      },
      function () {
        TutorialStep.parentScreen.resetCheckClickHelper();
        $("#remaining").text("6");
      },
      "right",
      "top"
    ),
    new TutorialStep(
      "    This is the gamedata, which summarizes your current game!",
      "#game-data",
      function () {
        TutorialStep.tutorialText.html(
          this.text +
            '<br/><i class="mdi mdi-clock"></i> Time Elapsed' +
            '<br/><i class="mdi mdi-help-circle"></i> Remaining Regions' +
            '<br/><i class="mdi mdi-check-circle"></i> Correct Clicks' +
            '<br/><i class="mdi mdi-close-box"></i> Incorrect Clicks (including skips!)' +
            '<br/><i class="mdi mdi-trophy"></i> Score for this Game' +
            '<br/><i class="mdi mdi-trophy-award"></i> High Score for all games on this map</i>' +
            "<br/>The greater your highscore, the better rank you can earn, from Tourist to Dignitary!"
        );
      },
      function () {},
      "left",
      "top"
    ),
    new TutorialStep(
      "    All that's left is for you is to go out and earn Dignitary Status!",
      null,
      function () {
        this.ok_advances_tutorial = false;
        TutorialStep.advanceTutorial.remove();
        $("#home-tutorial").show();
      },
      function () {}
    ),
  ];
  public static getCurrentStep(): TutorialStep {
    if (this.stepIndex < this.steps.length) return this.steps[this.stepIndex];
    else throw "Out of Steps :(";
  }
  public static nextStep(): TutorialStep {
    let prev_step = this.getCurrentStep();
    if (prev_step) prev_step.clean();
    this.stepIndex++;
    TutorialStep.advanceTutorial.prop("disabled", false);
    let step = this.getCurrentStep();
    this.tutorialText.text(step.text);
    step.init();
    if (step.click_elem_id) {
      $(step.click_elem_id).click(
        function () {
          this.nextStep();
        }.bind(this)
      );
    }
    step.align();
    return step;
  }
  public static init(screen: TutorialScreen): void {
    this.parentScreen = screen;
    this.tutorialPostcard = $("#tutorial-postcard");
    this.tutorialText = $("#tutorial-text");
    this.advanceTutorial = $("#advance-tutorial");
    this.advanceTutorial.click(
      function () {
        this.advanceTutorial.blur();
        if (TutorialStep.getCurrentStep().ok_advances_tutorial) this.nextStep();
      }.bind(this)
    );
    this.stepIndex = -1;
    this.nextStep();
  }
}

export class TutorialScreen extends MapScreen {
  public constructor(queries: URLSearchParams) {
    super(ScreenManager.TUTORIAL, queries);
  }

  public ready(): void {
    super.ready();
    $(".game-mode-select").attr("href", "#");
    TutorialStep.init(this);
  }

  public resetCheckClickHelper(): void {
    this.checkClickHelper = function (subregion: SubregionGeoJson): ColorEnum {
      if (subregion.properties.color) return subregion.properties.color;
      return SubregionColor.NEUTRAL;
    };
  }

  public checkClickHelper(subregion: SubregionGeoJson): ColorEnum {
    if (subregion.properties.color) return subregion.properties.color;
    return SubregionColor.NEUTRAL;
  }

  public subregionClick(subregion: SubregionGeoJson): ColorEnum {
    return this.checkClickHelper(subregion);
  }

  public subregionDragEnd(subregion: SubregionGeoJson): void {}

  protected subregionDragLeave(subregion: SubregionGeoJson): void {}

  protected subregionDragOver(subregion: SubregionGeoJson): void {}

  public getMapController(): MapController {
    return this.mapController;
  }

  protected dataLoaded(mapController: MapController, region: Region): void {
    super.dataLoaded(mapController, region);
    this.mapController.turnOffZoom();
    this.mapController.turnOffDragging();
  }
}
