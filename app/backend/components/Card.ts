import { RegionGeoJson, SubregionGeoJson } from "../../models/RegionModel";

/**
 * To be used during the game. Stores information about answers for during game.
 * subregionName: name of subregion
 * content: the content of the Card (depends on the type of game)
 * img_url: stores image of flag (only used during flag games)
 * id: used for security (to stop cheating)
 */
export interface Card {
  subregionName: string;
  content: string;
  img_url?: string;
  id?: string;
}

/**
 * Used as a base for storing all the cards used during the game.
 */
export abstract class CardStack {
  // list of Card objects
  private cards: Card[];
  // maps Card.id to Card.content
  private cardIdToContent: { [id: string]: string };
  // maps Card.id to subregionName
  private cardIdToSubregionName: { [id: string]: string };
  // maps subregionId to Card.content
  private subregionIdToContent: { [id: string]: string[] };
  // maps subregionName to Card.id
  private subregionNameToId: { [name: string]: string };

  /**
   * returns the length of the card array
   */
  public get length(): number {
    return this.cards.length;
  }

  /**
   * sets length of card arry (not meant to be used)
   */
  public set length(val: number) {
    throw "Length cannot be set";
  }

  /**
   * constructor for the CardStack class
   * @param region the region to create the card stack for
   * @param regionPath the path of the region (used for finding image links for flags)
   */
  public constructor(region: RegionGeoJson, regionPath: string) {
    this.cards = this.generateCards(region, regionPath);

    let i = 0;
    this.cardIdToContent = {};
    this.cardIdToSubregionName = {};
    for (let card of this.cards) {
      card.id = "gameplay-card-" + i++;
      this.cardIdToContent[card.id] = card.content;
      this.cardIdToSubregionName[card.id] = card.subregionName;
    }
    CardStack.shuffle(this.cards);

    let ids: string[] = [];
    for (i = 0; i < region.features.length; i++) {
      ids.push("subregion_" + i);
    }
    CardStack.shuffle(ids);
    this.subregionNameToId = {};
    i = 0;
    for (let subregion of region.features) {
      this.subregionNameToId[subregion.properties.name] = ids[i++];
    }

    this.subregionIdToContent = {};
    for (let card of this.cards) {
      if (this.subregionIdToContent[this.subregionNameToId[card.subregionName]])
        this.subregionIdToContent[
          this.subregionNameToId[card.subregionName]
        ].push(card.content);
      else
        this.subregionIdToContent[this.subregionNameToId[card.subregionName]] =
          [card.content];
    }
  }

  /**
   * generates the content of the Card array
   * @param region region to generate the Cards for
   * @param regionPath string path for the region (used for flag links)
   */
  protected abstract generateCards(
    region: RegionGeoJson,
    regionPath?: string
  ): Card[];

  /**
   * returns the Card array
   * @returns cards
   */
  public getCards(): Card[] {
    return this.cards;
  }

  /**
   * returns the mappings of Card.Id to Card.content
   * @returns cardIdToContent
   */
  public getCardIdToContent(): { [id: string]: string } {
    return this.cardIdToContent;
  }

  /**
   * return the mapping of Card.Id to Card.subregionname
   * @returns cardIdToSubregionName
   */
  public getCardIdToSubregionName(): { [id: string]: string } {
    return this.cardIdToSubregionName;
  }

  /**
   * returns the mappings of subregionId to Card.content
   * @returns subregionIdToContent
   */
  public getSubregionIdToContent(): { [id: string]: string[] } {
    return this.subregionIdToContent;
  }

  /**
   * returns the mappings of subregionName to Card.Id
   * @returns subregionNameToId
   */
  public getSubregionNameToId(): { [name: string]: string } {
    return this.subregionNameToId;
  }

  /**
   * randomizes the order of the array passed into this function
   * @param arr Card array to be shuffled
   */
  protected static shuffle(arr: any[]): void {
    for (let i = arr.length; i > 0; i--) {
      let j = Math.floor(Math.random() * i);
      [arr[i - 1], arr[j]] = [arr[j], arr[i - 1]];
    }
  }
}

/**
 * CardStack used for Name games. Overwrites the generateCards function to create Cards where
 * the content contains the name of the subregion
 */
export class NameCardStack extends CardStack {
  protected generateCards(region: RegionGeoJson): Card[] {
    let cards: Card[] = [];
    for (let subregion of region.features) {
      cards.push({
        subregionName: subregion.properties.name,
        content: subregion.properties.name,
      });
    }
    CardStack.shuffle(cards);
    return cards;
  }
}

/**
 * CardStack used for Capital games. Overwrites the generateCards function to create Cards where
 * the content is the name of the capital of the subregion
 */
export class CapitalCardStack extends CardStack {
  protected generateCards(region: RegionGeoJson): Card[] {
    let cards: Card[] = [];
    for (let subregion of region.features) {
      cards.push({
        subregionName: subregion.properties.name,
        content: subregion.properties.capital,
      });
    }
    CardStack.shuffle(cards);
    return cards;
  }
}

/**
 * CardStack used for Leader games. Overwrites the generateCards function to create Cards where
 * the content is the name of the leader of the subregion
 */
export class LeaderCardStack extends CardStack {
  protected generateCards(region: RegionGeoJson): Card[] {
    let cards: Card[] = [];
    for (let subregion of region.features) {
      cards.push({
        subregionName: subregion.properties.name,
        content: subregion.properties.leader,
      });
    }
    CardStack.shuffle(cards);
    return cards;
  }
}

/**
 * CardStack used for the Flag games. Overwrites the generateCards function to create Cards where
 * the content is the name of the subregion and the flag image is included in the img_url
 */
export class FlagCardStack extends CardStack {
  protected generateCards(region: RegionGeoJson, regionPath: string): Card[] {
    let cards: Card[] = [];
    for (let subregion of region.features) {
      cards.push({
        subregionName: subregion.properties.name,
        content: subregion.properties.name,
        img_url: `/img/${regionPath}/${subregion.properties.name} Flag.png`,
      });
    }
    CardStack.shuffle(cards);
    return cards;
  }
}

/**
 * CardStack used for the Landmark games. Overwrites the generateCards function to create Cards where
 * the content is the name of the landmark. Number of landmarks is not always equal to the number of subregions
 */
export class LandmarkCardStack extends CardStack {
  protected generateCards(region: RegionGeoJson, regionPath: string): Card[] {
    let cards: Card[] = [];
    for (let subregion of region.features) {
      if (subregion.properties.landmarks) {
        for (let landmark of subregion.properties.landmarks) {
          cards.push({
            subregionName: subregion.properties.name,
            content: landmark,
          });
        }
      }
    }
    CardStack.shuffle(cards);
    if (cards.length > region.features.length)
      cards.splice(region.features.length);
    return cards;
  }
}
