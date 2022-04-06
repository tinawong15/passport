import { ScreenManager } from "./ScreenManager";
import { toast } from "../components/toast";
import { DraggableCard } from "../components/DraggableCard";
import {
  GameplayMode,
  GameType,
  SubregionGeoJson,
} from "../../models/RegionModel";

export class GameplayManager {
  private static gameplayManager: GameplayManager;
  public static create(
    numSubregions: number,
    highscore: string,
    mode: GameplayMode
  ) {
    if (this.gameplayManager) this.dispose();
    this.gameplayManager = new GameplayManager(numSubregions, highscore, mode);
  }
  public static get(): GameplayManager {
    if (GameplayManager.gameplayManager) return GameplayManager.gameplayManager;
    throw "Gameplay Manager not properly intialized";
  }
  public static dispose(): void {
    if (GameplayManager.gameplayManager) {
      GameplayManager.gameplayManager.clearInterval();
      GameplayManager.gameplayManager = null;
    }
  }

  public correctSubregion: string;
  private _time: number;
  private $time: JQuery;
  set time(val: number) {
    this._time = val;
    let minutes = Math.floor(val / 60);
    let seconds = val % 60;
    this.$time.text(`${minutes}:${seconds < 10 ? "0" + seconds : seconds}`);
  }
  get time(): number {
    return this._time;
  }

  private isAnimating: boolean;

  private _remaining: number;
  private $remaining: JQuery;
  set remaining(val: number) {
    this._remaining = val;
    this.$remaining.text(val);
  }
  get remaining(): number {
    return this._remaining;
  }

  private _correct: number;
  private $correct: JQuery;
  set correct(val: number) {
    this._correct = val;
    this.$correct.text(val);
  }
  get correct(): number {
    return this._correct;
  }

  private _incorrect: number;
  private $incorrect: JQuery;
  set incorrect(val: number) {
    this._incorrect = val;
    this.$incorrect.text(val);
  }
  get incorrect(): number {
    return this._incorrect;
  }

  private _score: number;
  private $score: JQuery;
  set score(val: number) {
    if (isNaN(val)) val = 0;
    this._score = val;
    this.$score.text(val.toFixed(2).replace(/\.?0+$/, ""));
  }
  get score(): number {
    return this._score;
  }

  private $highscore: JQuery;
  set highscore(val: string) {
    this.$highscore.text(val);
  }

  private $cardArea: JQuery;
  private mode: GameplayMode;

  private counter: number;
  private paused: boolean;
  private gameInterval: number;
  private draggableCard: DraggableCard;

  private type: GameType;

  private constructor(
    numSubregions: number,
    highscore: string,
    mode: GameplayMode
  ) {
    console.log("gameplay manager");

    this.$time = $("#time");
    this.$remaining = $("#remaining");
    this.$correct = $("#correct");
    this.$incorrect = $("#incorrect");
    this.$score = $("#score");
    this.$highscore = $("#high-score");
    this.$cardArea = $("#card-area");

    this.time = 0;
    this.remaining = numSubregions;
    this.correct = 0;
    this.incorrect = 0;
    this.score = 0;
    this.highscore = highscore;

    this.draggableCard = new DraggableCard(mode);
    this.mode = mode;

    this.isAnimating = false;

    this.counter = 1;
    this.paused = true; // Pregame
    this.gameInterval = setInterval(
      function () {
        if (!this.paused) {
          this.time++;
        }
      }.bind(this),
      1000
    );

    this.updateDraggableCard();
  }

  public start(): void {
    this.paused = false;
    $.ajax({
      method: "POST",
      url: "/api/startgame",
      error(xhr, status, err) {
        toast("Server Error! Game might be corrupt", true);
      },
    });
    if (this.type === GameType.LEARN || this.type === GameType.TRAIN) {
      this.draggableCard.toggleDraggable();
    }
    // this.getCorrectSubregion();
  }
  public pause(): void {
    this.paused = true;
  }
  public resume(): void {
    this.paused = false;
  }

  public check(subregionId: string, callback: (correct: true) => void): void {
    console.log(subregionId + " " + this.getTopCardId());
    $.ajax({
      method: "POST",
      url: "/api/gameclick",
      data: {
        subregionId: subregionId,
        cardId: this.getTopCardId(),
      },
      success: function (data: any, status: string, xhr: JQueryXHR) {
        if (data.correct) {
          this.correct++;
          this.remaining--;
          this.popTopCard();
        } else this.incorrect++;
        callback(data.correct);
        this.score = (this.correct / (this.correct + this.incorrect)) * 100;
        if (data.victory) this.victory();
      }.bind(this),
      error(xhr, status, err) {
        toast("Server Error! Game might be corrupt", true);
      },
    });
  }

  public verify(subregionId: string, callback: (correct: true) => void): void {
    let verify = false;
    $.ajax({
      method: "POST",
      url: "/api/mouseover",
      data: {
        subregionId: subregionId,
        cardId: this.getTopCardId(),
      },
      success: function (data: any, status: string, xhr: JQueryXHR) {
        if (data.correct) {
          verify = true;
        }
        callback(data.correct);
      }.bind(this),
      error(xhr, status, err) {
        toast("Server Error! Game might be corrupt", true);
      },
    });
  }

  public skip(): void {
    this.remaining--;
    this.incorrect++;
    $.ajax({
      method: "POST",
      url: "/api/skip",
      data: {
        card_id: this.getTopCardId(),
      },
      success: function (data: any, status: string, xhr: JQueryXHR) {
        if (data.victory) this.victory();
      }.bind(this),
      error(xhr, status, err) {
        toast("Server Error! Game might be corrupt", true);
      },
    });
    this.popTopCard();
  }

  public victory() {
    if (this.type === GameType.LEARN || this.type == GameType.TRAIN) {
      this.draggableCard.toggleDraggable();
    }
    ScreenManager.get().switchScreens(ScreenManager.VICTORY, null);
    GameplayManager.dispose();
  }

  public clearInterval(): void {
    clearInterval(this.gameInterval);
  }

  private getTopCardSelector(): string {
    let t = `.game-card:nth-child(${this.counter})`;
    return `.game-card:nth-child(${this.counter})`;
  }

  public getTopCardId(): string {
    return $(this.getTopCardSelector()).attr("id");
  }

  private getTopCardContent(): string {
    let q = $(this.getTopCardSelector());
    return $(this.getTopCardSelector()).attr("data-content");
  }

  private getTopCardImage(): string {
    let q = $(this.getTopCardSelector());
    return $(this.getTopCardSelector()).attr("img-content");
  }

  private popTopCard() {
    this.isAnimating = true;
    let $card = $(this.getTopCardSelector()).animate(
      {
        "margin-left": "500px",
        opacity: "0.5",
      },
      {
        complete: function () {
          let margin = 0;
          let margin_top = +$card.css("margin-top");
          if (!isNaN(margin_top)) margin += margin_top;
          let margin_bot = +$card.css("margin-bottom");
          if (!isNaN(margin_bot)) margin += margin_bot;

          let top_card_height = $card.height();
          $card.hide();
          this.$cardArea.css("margin-top", top_card_height + margin).animate({
            "margin-top": "",
          });
          $(this.getTopCardSelector())
            .show()
            .animate({ height: top_card_height })
            .find(".gameplay-card")
            .css({ "background-color": "#7fb626" })
            .parent()
            .css({ opacity: "1" })
            .find(".card-icon")
            .show();
        }.bind(this),
      }
    );
    this.counter++;
    this.updateDraggableCard();
    this.isAnimating = false;
  }

  public getIsAnimating(): boolean {
    return this.isAnimating;
  }

  private updateDraggableCard() {
    this.draggableCard.updateInfo(
      this.getTopCardContent(),
      this.getTopCardImage(),
      this.getTopCardSelector()
    );
  }

  public isDragging(): boolean {
    return this.draggableCard.isVisible();
  }

  public toggleDraggableCard(): void {
    this.draggableCard.toggleDraggable();
  }

  public setGameType(type: GameType): void {
    this.type = type;
  }

  public setDraggableIsCorrectTrue(): void {
    this.draggableCard.setIsCorrectTrue();
  }
  public setDraggableIsCorrectFalse(): void {
    this.draggableCard.setIsCorrectFalse();
  }
}
