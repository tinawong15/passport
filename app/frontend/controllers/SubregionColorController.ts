import { ColorEnum } from "../../models/RegionModel";

export class SubregionColor {
  public static readonly NEUTRAL: ColorEnum = "neutral";
  public static readonly CORRECT: ColorEnum = "correct";
  public static readonly INCORRECT: ColorEnum = "incorrect";
  private static readonly NEUTRAL_HOVER: ColorEnum = "neutral_hover";
  public static readonly CORRECT_HOVER: ColorEnum = "correct_hover";
  private static readonly INCORRECT_HOVER: ColorEnum = "incorrect_hover";
  private static readonly NEUTRAL_COLOR = "#555555";
  private static readonly NEUTRAL_HOVER_COLOR = "#949494";
  private static readonly CORRECT_COLOR = "#38BE41";
  private static readonly CORRECT_HOVER_COLOR = "#FFD700";
  private static readonly INCORRECT_COLOR = "#9E0718";
  private static readonly INCORRECT_HOVER_COLOR = "#BF3A49";
  private static readonly colorMap = new Map<ColorEnum, string>([
    [SubregionColor.NEUTRAL, SubregionColor.NEUTRAL_COLOR],
    [SubregionColor.NEUTRAL_HOVER, SubregionColor.NEUTRAL_HOVER_COLOR],
    [SubregionColor.CORRECT, SubregionColor.CORRECT_COLOR],
    [SubregionColor.CORRECT_HOVER, SubregionColor.CORRECT_HOVER_COLOR],
    [SubregionColor.INCORRECT, SubregionColor.INCORRECT_COLOR],
    [SubregionColor.INCORRECT_HOVER, SubregionColor.INCORRECT_HOVER_COLOR],
  ]);
  private static readonly toggleHoverMap = new Map<ColorEnum, ColorEnum>([
    [SubregionColor.NEUTRAL, SubregionColor.NEUTRAL_HOVER],
    [SubregionColor.NEUTRAL_HOVER, SubregionColor.NEUTRAL],
    [SubregionColor.CORRECT, SubregionColor.CORRECT],
    [SubregionColor.CORRECT_HOVER, SubregionColor.CORRECT],
    [SubregionColor.INCORRECT, SubregionColor.INCORRECT_HOVER],
    [SubregionColor.INCORRECT_HOVER, SubregionColor.INCORRECT],
  ]);
  private static baseToHoverColorMap = new Map<ColorEnum, ColorEnum>([
    [SubregionColor.NEUTRAL, SubregionColor.NEUTRAL_HOVER],
    [SubregionColor.NEUTRAL_HOVER, SubregionColor.NEUTRAL_HOVER],
    [SubregionColor.CORRECT, SubregionColor.CORRECT_HOVER],
    [SubregionColor.CORRECT_HOVER, SubregionColor.CORRECT_HOVER],
    [SubregionColor.INCORRECT, SubregionColor.INCORRECT_HOVER],
    [SubregionColor.INCORRECT_HOVER, SubregionColor.INCORRECT_HOVER],
  ]);
  private static hoverToBaseColorMap = new Map<ColorEnum, ColorEnum>([
    [SubregionColor.NEUTRAL, SubregionColor.NEUTRAL],
    [SubregionColor.NEUTRAL_HOVER, SubregionColor.NEUTRAL],
    [SubregionColor.CORRECT, SubregionColor.CORRECT],
    [SubregionColor.CORRECT_HOVER, SubregionColor.CORRECT],
    [SubregionColor.INCORRECT, SubregionColor.INCORRECT],
    [SubregionColor.INCORRECT_HOVER, SubregionColor.INCORRECT],
  ]);

  public static getColorCode(colorName: ColorEnum): string {
    return this.colorMap.get(colorName);
  }
  public static toggleHover(colorName: ColorEnum): ColorEnum {
    return this.toggleHoverMap.get(colorName);
  }
  public static addHover(colorName: ColorEnum): ColorEnum {
    return this.baseToHoverColorMap.get(colorName);
  }
  public static removeHover(colorName: ColorEnum): ColorEnum {
    return this.hoverToBaseColorMap.get(colorName);
  }
}
