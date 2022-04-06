import { UserManager } from "../managers/UserManager";
import { PostCardCanvas } from "../components/PostCardCanvas";
import { Region } from "../components/Region";
import { Overlay } from "./Overlay";
import { ScreenManager } from "../managers/ScreenManager";

export class PreNavScreen extends Overlay {
  private greetingsCanvas: PostCardCanvas;
  private region: Region;
  private overlayArray: JQuery; //array of the various overlays that can be displayed
  private currentOverlayIndex: number; //index of current overlay

  public constructor(queries: URLSearchParams) {
    super(ScreenManager.PRENAV, queries);
  }

  public ready(): void {
    super.ready();

    let cards = $(".howtoplay-cards");
    this.initOverlayArray();

    // for (let i = 0; i < cards.length; i++) {
    //   let degrees = Math.random() * 5 - 2.5;
    //   $(cards[i]).css({
    //     "-webkit-transform": "rotate(" + degrees + "deg)",
    //     "-moz-transform": "rotate(" + degrees + "deg)",
    //     "-o-transform": "rotate(" + degrees + "deg)",
    //     "-ms-transform": "rotate(" + degrees + "deg)",
    //     transform: "rotate(" + degrees + "deg)",
    //   });
    // }

    this.attachHandler(
      "#close-overlay",
      "click",
      function () {
        ScreenManager.get().closeOverlay();
      }.bind(this)
    );

    this.attachHandler(
      "#next-overlay",
      "click",
      function () {
        this.next();
      }.bind(this)
    );

    this.attachHandler(
      "#previous-overlay",
      "click",
      function () {
        this.previous();
      }.bind(this)
    );

    if (this.isDataLoaded) {
      this.initGreetingsCanvas();
      this.initRank();
      $(".subregion-type").text(this.region.properties.subregion_type);
      $("#close-overlay").removeAttr("disabled");
      $("#next-overlay").removeAttr("disabled");
    } else {
      Object.defineProperty(this, "isDataLoaded", {
        configurable: true,
        get: function () {
          return this._isDataLoaded;
        },
        set: function (isDataLoaded: boolean) {
          this._isDataLoaded = isDataLoaded;
          if (isDataLoaded) {
            this.initGreetingsCanvas();
            this.initRank();
            $(".subregion-type").text(this.region.properties.subregion_type);
            $("#close-overlay").removeAttr("disabled");
            $("#next-overlay").removeAttr("disabled");
          }
        },
      });
    }
  }

  public dataLoaded(region: Region): void {
    this.region = region;
    this.isDataLoaded = true;
  }

  private initGreetingsCanvas(): void {
    this.greetingsCanvas = new PostCardCanvas(this.region);
    this.greetingsCanvas.createCanvas();
  }

  private initRank() {
    let rank = null; //UserManager.get().user.gameData.getData(this.region.getPath()).getRank();
    let $rank = $(".user-rank");
    if (rank == null) {
      $rank.parent().hide();
    } else {
      $rank.parent().show();
      $rank.text(rank);
    }
  }

  private initOverlayArray() {
    this.overlayArray = $(".overlay");
    $(this.overlayArray[1]).css("display", "none");
    $(this.overlayArray[2]).css("display", "none");
    this.currentOverlayIndex = 0;
  }

  private next() {
    if (this.currentOverlayIndex < this.overlayArray.length - 1) {
      $(this.overlayArray[this.currentOverlayIndex]).css("display", "none");
      this.currentOverlayIndex++;
      $(this.overlayArray[this.currentOverlayIndex]).css("display", "flex");
      if (this.currentOverlayIndex >= this.overlayArray.length - 1) {
        $("#next-overlay").prop("disabled", true);
      }
      $("#previous-overlay").removeAttr("disabled");
    }
  }

  private previous() {
    if (this.currentOverlayIndex > 0) {
      $(this.overlayArray[this.currentOverlayIndex]).css("display", "none");
      this.currentOverlayIndex--;
      $(this.overlayArray[this.currentOverlayIndex]).css("display", "flex");
      if (this.currentOverlayIndex <= 0) {
        $("#previous-overlay").prop("disabled", true);
      }
      $("#next-overlay").removeAttr("disabled");
    }
  }
}
