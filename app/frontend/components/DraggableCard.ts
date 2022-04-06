import { GameplayMode } from "../../models/RegionModel";

export class DraggableCard {
  // root element and child elements as needed
  private rootElement: JQuery; // draggable card itself
  private titleElement: JQuery; // for putting game info on draggable
  private flagElement: JQuery; // for displaying flag image on draggable
  private addressElement: JQuery; // dashes in the top left, used for resizing
  private rvImageElement: JQuery; // RV image in top right, used for resizing

  // reference to original card
  private originalCardElement: JQuery;

  // current gameplay mode
  private mode: GameplayMode;

  // whether or not this card is visible
  private visible: boolean;

  // whether or not the card can be dragged
  private isDraggable: boolean;

  // whether or not he card was dropped on a correct region
  private isCorrect: boolean = false;

  // initial size of draggable
  private resetHeight: number = 150;
  private resetWidth: number = 300;

  // size of draggable while it is being dragged
  private dragHeight: number = 75;
  private dragWidth: number = 150;

  //size of orignial font
  private orginalFont: string;

  /**
   * sets up reference to html object
   */
  public constructor(mode: GameplayMode) {
    this.rootElement = $("#card-draggable");
    this.titleElement = $("#card-draggable-title");
    this.flagElement = $("#card-draggable-image");
    this.addressElement = this.rootElement.find(".generic-address");
    this.rvImageElement = this.rootElement.find("#card-draggable-icon");
    this.isDraggable = false;
    this.mode = mode;
    this.rootElement.css("font-size", ".15rem");

    if (mode != GameplayMode.FLAG) {
      $("#card-draggable .card-icon").css("display", "block");
    }

    (<any>this.rootElement).draggable({
      start: function (event: Event, ui: Object) {
        this.isCorrect = false;
        console.log("isCorrect " + this.isCorrect);
        this.rootElement.css("pointer-events", "none");
        this.show();
      }.bind(this),
      stop: function (event: Event, ui: Object) {
        this.rootElement.css("pointer-events", "");
        this.dropAnimation();
      }.bind(this),
      cursorAt: { left: 0, top: 5 },
      // stop: function (event: Event, ui: Object) {
      //   this.rootElement.css("pointer-events", "");
      //   this.hide();
      // }.bind(this),
      // revert: true,
    });

    (<any>this.rootElement).draggable({
      disabled: !this.isDraggable,
    });

    this.visible = false;
    this.hide();
  }

  // returns whether or not this card is visible (same as isBeingDragged)
  public isVisible(): boolean {
    return this.visible;
  }

  // enables/disables draggable card
  public toggleDraggable(): void {
    this.isDraggable = !this.isDraggable;
    (<any>this.rootElement).draggable({
      disabled: !this.isDraggable,
    });
  }

  // makes draggable card visible
  public show() {
    this.rootElement.css("opacity", "0.8");
    this.visible = true;
    if (this.originalCardElement) {
      this.originalCardElement.css("opacity", 0);
    }
    this.rootElement.css({
      height: this.dragHeight,
      width: this.dragWidth,
    });
    // this.rootElement.css("transform", "scale(0.5)");
    this.addressElement.css("font-size", "0.15rem");
    this.titleElement.css("font-size", "1rem");
    this.rvImageElement.css("transform", "scale(0.7)");
    this.rvImageElement.css("transform-origin", "top right");
  }

  // reset size/position of draggable card
  private resetDraggable() {
    this.rootElement.css({
      left: "0px",
      top: "7px",
      height: this.resetHeight,
      width: this.resetWidth,
    });
    this.addressElement.animate(
      {
        "font-size": "0.15rem",
      },
      500,
      function () {
        // after animation
      }.bind(this)
    );
  }

  // simple hide, just make draggable transparent
  public hide() {
    this.rootElement.css("opacity", "0");
    this.visible = false;
    if (this.originalCardElement) {
      this.originalCardElement.css("opacity", 1);
    }
    this.resetDraggable();
  }

  //lets draggable card know it has been dropped on the correct region
  public setIsCorrectTrue(): void {
    this.isCorrect = true;
  }

  //lets draggable card know it has not been dropped on the correct region
  public setIsCorrectFalse(): void {
    this.isCorrect = false;
  }

  //selects between the hideCorrect or hideIncorrect animation when dropped
  public dropAnimation(): void {
    if (this.isCorrect) {
      this.hideCorrect();
    } else {
      this.hideIncorrect();
    }
  }

  // reverts draggable to top of card stack and makes draggable invisible
  public hideIncorrect() {
    //reset the font back to it's original size
    this.titleElement.animate({
      "font-size": this.orginalFont,
    });
    // this.rootElement.css("transform", "scale(1.0)");
    // first animate draggable back to top of card stack using last known position
    this.rootElement.animate(
      {
        left: "0px",
        top: "0px",
        height: this.resetHeight,
        width: this.resetWidth,
      },
      500,
      function () {
        // occurs after animation is over
        this.rootElement.css("opacity", "0");
        this.visible = false;
        if (this.originalCardElement) {
          this.originalCardElement.css("opacity", 1);
        }
        this.resetDraggable();
      }.bind(this)
    );
  }

  // shrinks draggable into map, hides draggable, then puts draggable back in original position
  public hideCorrect() {
    this.rootElement.animate(
      {
        height: 0,
        width: 0,
      },
      500,
      function () {
        // occurs after shrink
        this.rootElement.css("opacity", "0");
        this.visible = false;
        if (this.originalCardElement) {
          this.originalCardElement.css("opacity", 1);
        }
        this.resetDraggable();
      }.bind(this)
    );
    this.isCorrect = false;
    console.log(this.isCorrect);
  }

  /**
   * sends the info from the top card to the draggable card for display purposes
   * @param id string of content to be displayed
   * @param image flag being displayed (flag only)
   * @param originalSelector selector string for the original card for hiding purposes
   */
  public updateInfo(content: string, image: string, originalSelector: string) {
    this.titleElement.html(content);
    this.orginalFont = this.titleElement.css("font-size");
    //this.flagElement.css("background-image", 'url("' + image + '")');
    this.originalCardElement = $(originalSelector);
  }
}
