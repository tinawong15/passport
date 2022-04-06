import { NavScreen } from "../screens/NavScreen";
import { PreNavScreen } from "../screens/PreNavScreen";
import { PauseScreen } from "../screens/PauseScreen";
import { PreGameScreen } from "../screens/PreGameScreen";
import { VictoryScreen } from "../screens/VictoryScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { GameplayScreen } from "../screens/GameplayScreen";
import { TutorialScreen } from "../screens/TutorialScreen";
import { AuthScreen } from "../screens/AuthScreen";
import { Screen } from "../screens/Screen";
import { UserManager } from "./UserManager";
import { Overlay } from "../screens/Overlay";
import { PassportScreen } from "../screens/PassportScreen";
import { Region } from "../components/Region";

export type OverlayEnum =
  | "prenav"
  | "pregame"
  | "pause"
  | "victory"
  | "passport";
export type ScreenEnum =
  | "splash"
  | "map"
  | "gameplay"
  | "learning"
  | "testing"
  | "tutorial"
  | "auth"
  | OverlayEnum;
export class ScreenManager {
  private static screenManager: ScreenManager;
  public static get(): ScreenManager {
    if (!this.screenManager) this.screenManager = new ScreenManager();
    return this.screenManager;
  }

  public static readonly SPLASH: ScreenEnum = "splash";
  public static readonly NAV: ScreenEnum = "map"; // URL reads /map, but it uses NavScreen
  public static readonly PRENAV: ScreenEnum = "prenav";
  public static readonly PREGAME: ScreenEnum = "pregame";
  public static readonly PAUSE: ScreenEnum = "pause";
  public static readonly GAMEPLAY: ScreenEnum = "gameplay";
  public static readonly LEARNING: ScreenEnum = "learning";
  public static readonly TESTING: ScreenEnum = "testing";
  public static readonly VICTORY: ScreenEnum = "victory";
  public static readonly TUTORIAL: ScreenEnum = "tutorial";
  public static readonly PASSPORT: ScreenEnum = "passport";
  public static readonly AUTH: ScreenEnum = "auth";

  private screenMap: Object;
  private loader: JQuery;
  private mainContainer: JQuery;
  private currentBaseScreen: Screen;
  private currentBaseScreenEnum: ScreenEnum;
  private currentOverlay: Overlay;
  private currentOverlayEnum: OverlayEnum;
  private region: Region;

  private constructor() {
    // Ideally, this should be a static Map<ScreenEnum, Screen>, but I couldn't pass a class itself to a map :(
    this.screenMap = {};
    this.screenMap[ScreenManager.SPLASH] = SplashScreen;
    this.screenMap[ScreenManager.NAV] = NavScreen;
    this.screenMap[ScreenManager.PRENAV] = PreNavScreen;
    this.screenMap[ScreenManager.PREGAME] = PreGameScreen;
    this.screenMap[ScreenManager.PAUSE] = PauseScreen;
    this.screenMap[ScreenManager.GAMEPLAY] = GameplayScreen;
    //TODO learningscreen
    //TODO testingscreen
    this.screenMap[ScreenManager.VICTORY] = VictoryScreen;
    this.screenMap[ScreenManager.TUTORIAL] = TutorialScreen;
    this.screenMap[ScreenManager.PASSPORT] = PassportScreen;
    this.screenMap[ScreenManager.AUTH] = AuthScreen;

    /**
     * Popstate / Back Button
     */
    $(window).on(
      "popstate",
      function (e: JQueryEventObject) {
        if (history.state !== null) {
          let queries: any = {};
          for (let q in history.state) {
            if (q != "screen" && q != "property") {
              queries[q] = history.state[q];
            }
          }
          this.switchScreens(history.state.screen, queries, false);
        }
      }.bind(this)
    );

    $(document).on(
      "click",
      "a",
      function (e: JQueryEventObject) {
        let href = $(e.currentTarget).attr("href");

        // non-event and internal links only
        if (
          href &&
          href.indexOf("#") == -1 &&
          (href.indexOf(document.domain) > -1 || href.indexOf(":") === -1)
        ) {
          e.preventDefault(); // prevent link from working normally

          let url_components = href.split("?");

          let path = url_components[0];
          if (path[0] == "/") path = path.slice(1);
          if (!(path in this.screenMap)) path = ScreenManager.SPLASH;

          let queries: string;
          if (url_components.length > 1) queries = url_components[1];
          else queries = "";

          this.switchScreens(path, new URLSearchParams(queries));
        }
      }.bind(this)
    );

    // loading indicator overlay*/
    this.loader = $("#loading-overlay");
    this.mainContainer = $("#main-container");
  }

  public setupInitScreen(): void {
    // load and display the current screen
    let screenSwitch: ScreenEnum = <ScreenEnum>(
      window.location.pathname.split(/[\/?]/)[1]
    );

    this.currentBaseScreenEnum = this.screenMap[screenSwitch]
      ? screenSwitch
      : ScreenManager.SPLASH;
    this.currentBaseScreen = new this.screenMap[this.currentBaseScreenEnum](
      new URLSearchParams(window.location.search)
    );

    // set initial state (for going back later)
    history.replaceState(
      { screen: this.currentBaseScreen.name },
      "",
      window.location.pathname + window.location.search
    );

    console.log("Switch " + this.currentBaseScreenEnum);
    this.currentBaseScreen.ready();

    $("#loading-overlay").fadeOut("fast");
  }

  public switchScreens(
    screen: ScreenEnum,
    queries: URLSearchParams,
    pushState = true
  ): void {
    let newScreenEnum =
      screen && screen in this.screenMap ? screen : ScreenManager.SPLASH;
    let newScreen: Screen = new this.screenMap[newScreenEnum](queries);
    if (!newScreen.overlay) this.loader.fadeIn("fast");

    $(".material-tooltip").remove();

    $.ajax({
      method: "GET",
      url: ScreenManager.generateURL(newScreen),
      success: function (data: any, status: string, xhr: JQueryXHR) {
        if (this.currentBaseScreen) this.currentBaseScreen.detachHandlers();
        if (this.currentOverlay) this.currentOverlay.detachHandlers();
        if (newScreen.overlay) {
          if (this.currentOverlay && this.currentOverlay.overlayElement) {
            this.currentOverlay.overlayElement.remove();
          }
          this.currentOverlay = <Overlay>newScreen;
          this.currentOverlay.overlayElement = $(data).find(".screen-overlay");
          this.currentOverlayEnum = <OverlayEnum>newScreenEnum;
          this.mainContainer.prepend($(data).filter("#main-container").html());
          this.currentOverlay.overlayElement =
            this.mainContainer.find(".screen-overlay");

          if (this.region) {
            this.currentOverlay.dataLoaded(this.region);
            this.region = null;
          }
          this.currentOverlay.ready();
        } else {
          if (this.currentBaseScreen) this.currentBaseScreen.onLeave();
          this.currentBaseScreen = newScreen;
          this.currentBaseScreenEnum = newScreenEnum;
          if (this.currentOverlay) this.currentOverlay.onLeave();
          this.currentOverlay = null;
          this.mainContainer.fadeOut(
            "fast",
            function () {
              this.mainContainer.html($(data).filter("#main-container").html());
              this.mainContainer.fadeIn(
                "fast",
                function () {
                  document.title = $(data).filter("title").text();
                  this.loader.fadeOut("fast");
                  $("html, body").animate({ scrollTop: 0 }, "fast");
                  this.currentBaseScreen.ready();
                }.bind(this)
              );
            }.bind(this)
          );

          if (pushState)
            history.pushState(null, "", ScreenManager.generateURL(newScreen));
        }
      }.bind(this),
      dataType: "html",
      error: function (xhr: JQueryXHR, status: string, err: string) {
        newScreen.error();
        this.loader.fadeOut("fast");
      }.bind(this),
    });
  }

  public closeOverlay(): void {
    if (this.currentOverlay) {
      this.currentOverlay.detachHandlers();
      if (this.currentOverlay.overlayElement)
        this.currentOverlay.overlayElement.remove();
      this.currentBaseScreen.reattachHandlers();
    }
  }

  public passRegionToOverlay(region: Region): void {
    if (this.currentOverlay) this.currentOverlay.dataLoaded(region);
    else this.region = region;
  }

  /**
   * Back button
   * Same as browser button
   *
   * Screens user is not allowed to return to are
   * not pushed to the history stack
   */
  back(): void {
    history.back();
  }

  public static generateURL(screen: Screen): string {
    let url = screen.name == ScreenManager.SPLASH ? "/" : "/" + screen.name;

    if (screen.queries) {
      url += "?" + screen.queries.toString();
    }

    return url;
  }
}
