export interface RegionGeoJson extends GeoJSON.FeatureCollection {
  properties: {
    subregions_have_names: boolean;
    subregions_have_capitals: boolean;
    subregions_have_leaders: boolean;
    subregions_have_flags: boolean;
    subregions_have_landmarks: boolean;
    subregion_type: string;
  };
  features: Array<SubregionGeoJson>;
}

export interface SubregionGeoJson extends GeoJSON.Feature {
  properties: {
    name?: string;
    capital?: string;
    leader?: string;
    landmarks?: string[];
    color?: ColorEnum; // Used by map controller
    id?: string; // Used during gameplay
  };
}

export type ColorEnum =
  | "neutral"
  | "neutral_hover"
  | "correct"
  | "correct_hover"
  | "incorrect"
  | "incorrect_hover";

export enum GameplayMode {
  NAME = "name",
  CAPITAL = "capital",
  LEADER = "leader",
  FLAG = "flag",
  LANDMARKS = "landmarks",
}

export enum RegionProp {
    NAME = 'name',
    CAPITAL = 'capital',
    LEADER = 'leader',
    LANDMARKS = 'landmarks'
}

export enum GameType {
    LEARN = 'learn',
    TRAIN = 'train',
    TEST = 'test'
}
