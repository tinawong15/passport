import { Region } from "../components/Region";

// Can't make TypeScript recognize document.fonts natively
// https://drafts.csswg.org/css-font-loading/#font-face-constructor
declare global {
  interface Document {
    fonts: any;
  }
}

class CanvasPixel {
  private static canvas: PostCardCanvas;
  private static allPixels: CanvasPixel[];
  public static init(canvas: PostCardCanvas) {
    this.canvas = canvas;
    this.allPixels = [];
  }

  private index: number;
  private section: CanvasSection;

  public constructor(firstcolorindex: number) {
    if (firstcolorindex % 4 != 0) {
      throw "Invalid first color index";
    }
    let index = firstcolorindex / 4;
    this.index = index;
    CanvasPixel.allPixels[index] = this;
  }
  public getIndex(): number {
    return this.index;
  }
  public getFirstColorIndex(): number {
    return this.index * 4;
  }
  public getX(): number {
    return this.index % CanvasPixel.canvas.getWidth();
  }
  public getY(): number {
    return Math.floor(this.index / CanvasPixel.canvas.getWidth());
  }
  public getPixelLeft(): CanvasPixel {
    if (this.index % CanvasPixel.canvas.getWidth())
      return CanvasPixel.allPixels[this.index - 1];
    return undefined;
  }
  public getPixelAbove(): CanvasPixel {
    if (this.index < CanvasPixel.canvas.getWidth()) return undefined;
    return CanvasPixel.allPixels[this.index - CanvasPixel.canvas.getWidth()];
  }
  public getSection(): CanvasSection {
    return this.section;
  }
  public addToSection(section: CanvasSection): CanvasPixel {
    this.section = section;
    return this;
  }
}
class CanvasSectionBounds {
  private leftmostX: number;
  private highestY: number;
  private rightmostX: number;
  private lowestY: number;
  public constructor(pixels: CanvasPixel[]) {
    this.leftmostX = pixels[0].getX();
    let highestpoint = pixels[0];
    this.rightmostX = pixels[0].getX();
    let lowestpoint = pixels[0];
    for (let i = 1; i < pixels.length; i++) {
      if (pixels[i].getIndex() > lowestpoint.getIndex())
        lowestpoint = pixels[i];
      if (pixels[i].getIndex() < highestpoint.getIndex())
        highestpoint = pixels[i];
      let x = pixels[i].getX();
      if (x < this.leftmostX) this.leftmostX = x;
      if (x > this.rightmostX) this.rightmostX = x;
    }
    this.highestY = highestpoint.getY();
    this.lowestY = lowestpoint.getY();
  }
  public getLeftmostX(): number {
    return this.leftmostX;
  }
  public getHighestY(): number {
    return this.highestY;
  }
  public getRightmostX(): number {
    return this.rightmostX;
  }
  public getLowestY(): number {
    return this.lowestY;
  }
  public getWidth(): number {
    return this.getRightmostX() - this.getLeftmostX() + 1;
  }
  public getHeight(): number {
    return this.getLowestY() - this.getHighestY() + 1;
  }
}

class CanvasSection {
  private pixels: CanvasPixel[];

  public constructor() {
    this.pixels = [];
  }
  public addPixel(pixel: CanvasPixel): CanvasSection {
    this.pixels.push(pixel);
    pixel.addToSection(this);
    return this;
  }
  public getPixels(): CanvasPixel[] {
    return this.pixels;
  }
  public size(): number {
    return this.pixels.length;
  }
  public sort(): CanvasSection {
    this.pixels.sort((a, b) => {
      return a.getIndex() - b.getIndex();
    });
    return this;
  }
  public getBounds(): CanvasSectionBounds {
    return new CanvasSectionBounds(this.getPixels());
  }

  public static getLetters(imageData: ImageData): CanvasSection[] {
    let sections: CanvasSection[] = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] == 0) {
        let pixel = new CanvasPixel(i);
        let leftPixel = pixel.getPixelLeft();
        let abovePixel = pixel.getPixelAbove();
        if (leftPixel == undefined) {
          if (abovePixel == undefined) {
            sections.push(new CanvasSection().addPixel(pixel));
          } else {
            abovePixel.getSection().addPixel(pixel);
          }
        } else {
          leftPixel.getSection().addPixel(pixel);
          if (
            abovePixel != undefined &&
            pixel.getSection() != abovePixel.getSection()
          ) {
            let sectionToStay = abovePixel.getSection();
            let sectionToDelete = pixel.getSection();
            for (let newpoint of sectionToDelete.getPixels()) {
              sectionToStay.addPixel(newpoint);
            }
            sections.splice(sections.indexOf(sectionToDelete), 1);
          }
        }
      }
    }
    let total = 0,
      count = 0;
    for (let i = 0; i < sections.length; i++) {
      total += sections[i].size();
      count++;
    }
    let uppercutoff = (2 * total) / count;
    total = 0;
    count = 0;
    let temp = [];
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].size() < uppercutoff) {
        temp.push(sections[i].sort());
        total += sections[i].size();
        count++;
      }
    }
    let lowercutoff = total / count / 2;
    let letters = [];
    for (let i = 0; i < temp.length; i++) {
      if (temp[i].size() > lowercutoff) {
        letters.push(sections[i]);
      }
    }
    return letters;
  }
}

export class PostCardCanvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private text: string;
  private fontSize: number;
  private useSubregionFlags: boolean;
  private useParentRegionFlag: boolean;
  private flags: string[];

  public constructor(region: Region) {
    CanvasPixel.init(this);
    this.canvas = <HTMLCanvasElement>document.getElementById("postcard-canvas");
    this.width = this.canvas.width = Math.ceil($(this.canvas).width());
    this.height = this.canvas.height = Math.ceil($(this.canvas).height());
    this.context = this.canvas.getContext("2d");
    //this.text = region.name;
    this.text = "Regio Vinco";
    this.useSubregionFlags = region.properties.subregions_have_flags;
    if (this.useSubregionFlags) {
      this.useParentRegionFlag = false;
      this.flags = region.getSubregionFlagURLs();
    } else {
      this.useParentRegionFlag = false;
      if (this.useParentRegionFlag) this.flags = [region.getFlagURL()];
    }
  }
  public getWidth(): number {
    return this.width;
  }
  public getHeight(): number {
    return this.height;
  }
  public getFontSize(): number {
    return this.fontSize;
  }
  public getCanvasHTMLElement() {
    return this.canvas;
  }
  public async createCanvas() {
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    await document.fonts.ready;
    this.setContextFont();
    this.context.fillText(this.text, this.width / 2, this.height / 2);
    if (!this.useSubregionFlags && !this.useParentRegionFlag) return;
    let imageData = this.context.getImageData(0, 0, this.width, this.height);
    let letters = CanvasSection.getLetters(imageData);
    this.context.clearRect(0, 0, this.width, this.height);
    while (this.flags.length > letters.length) {
      this.flags.splice(Math.floor(Math.random() * this.flags.length), 1);
    }
    while (this.flags.length < letters.length) {
      this.flags.push(
        this.flags[Math.floor(Math.random() * this.flags.length)]
      );
    }
    if (this.useSubregionFlags) this.shuffle(this.flags);
    let countdown = this.flags.length;
    for (let i = 0; i < this.flags.length; i++) {
      let img = new Image();
      img.onload = function () {
        this.drawToLetter(imageData, letters[i], img);
        if (--countdown == 0) {
          this.context.putImageData(imageData, 0, 0);
          this.context.fillStyle = "white";
          let outlineSize = 1;
          this.context.fillText(
            this.text,
            this.width / 2 - outlineSize,
            this.height / 2 - outlineSize
          );
          this.context.fillText(
            this.text,
            this.width / 2 - outlineSize,
            this.height / 2 + outlineSize
          );
          this.context.fillText(
            this.text,
            this.width / 2 + outlineSize,
            this.height / 2 - outlineSize
          );
          this.context.fillText(
            this.text,
            this.width / 2 + outlineSize,
            this.height / 2 + outlineSize
          );
          this.context.fillStyle = "black";
          this.context.fillText(this.text, this.width / 2, this.height / 2);
        }
      }.bind(this);
      img.src = this.flags[i];
    }
  }
  private shuffle(arr: any[]): void {
    for (let i = arr.length; i > 0; i--) {
      let j = Math.floor(Math.random() * i);
      [arr[i - 1], arr[j]] = [arr[j], arr[i - 1]];
    }
  }
  private setContextFont(): void {
    this.fontSize = 200;
    do {
      this.fontSize -= 10;
      this.context.font = this.fontSize.toString() + "px VacationPostcardNF";
    } while (this.context.measureText(this.text).width > this.width - 10);
    let pos = $(this.canvas).position();
    $("#transparent-name-overlay")
      .text(this.text)
      .css({
        "font-size": this.fontSize + "px",
        left: this.width / 2 - pos.left - this.width / 2,
        top: this.height / 2 - pos.top + this.height / 2,
      });
  }
  private drawToLetter(
    imageData: ImageData,
    letter: CanvasSection,
    img: HTMLImageElement
  ) {
    let canvas = $("<canvas>");
    let ctx = (<HTMLCanvasElement>canvas.get(0)).getContext("2d");
    let bounds = letter.getBounds();
    let letter_width = bounds.getWidth();
    let letter_height = bounds.getHeight();
    let img_aspect_ratio = img.width / img.height;
    let canvas_width, canvas_height;
    if (letter_height * img_aspect_ratio > letter_width) {
      canvas_width = Math.floor(letter_height * img_aspect_ratio);
      canvas_height = letter_height;
    } else {
      canvas_width = letter_width;
      canvas_height = Math.floor(letter_height / img_aspect_ratio);
    }
    let canvasStartingX = Math.floor(canvas_width / 2 - letter_width / 2);
    let imgStartingX = Math.floor((canvasStartingX / canvas_width) * img.width);
    let canvasStartingY = Math.floor(canvas_height / 2 - letter_height / 2);
    let imgStartingY = Math.floor(
      (canvasStartingY / canvas_height) * img.height
    );
    ctx.drawImage(
      img,
      imgStartingX,
      imgStartingY,
      img.width,
      img.height,
      0,
      0,
      canvas_width,
      canvas_height
    );
    let color = ctx.getImageData(0, 0, canvas_width, canvas_height).data;
    let lastY = null;
    let offset =
      4 * (bounds.getHighestY() * this.width + bounds.getLeftmostX());
    for (let point of letter.getPixels()) {
      let y = point.getY();
      if (lastY != null && lastY != y) {
        offset += (y - lastY) * this.width * 4 - canvas_width * 4;
      }
      let index = point.getFirstColorIndex();
      let red = color[index - offset];
      let green = color[index - offset + 1];
      let blue = color[index - offset + 2];
      imageData.data[index] = red;
      imageData.data[index + 1] = green;
      imageData.data[index + 2] = blue;
      imageData.data[index + 3] = color[index - offset + 3];
      lastY = y;
    }
  }
}
