import {
  RegionGeoJson,
  GameplayMode,
  SubregionGeoJson,
} from "../../models/RegionModel";
import {
  Card,
  CardStack,
  NameCardStack,
  CapitalCardStack,
  LeaderCardStack,
  FlagCardStack,
  LandmarkCardStack,
} from "./Card";

/**
 * Stores the information used during the game
 * numSubregions: total number of subregions for this region
 * correctPercentage: current num correct guesses / total guesses
 * seconds: number of seconds passed
 * correct: number of correct guesses
 * incorrect: number of incorrect guesses
 */
export interface GameInfo {
  numSubregions: number;
  correctPercentage: number;
  seconds: number;
  correct: number;
  incorrect: number;
}

/**
 * Stores data needed for the player to play the game
 * regionPath: path to this region (used for flag images)
 * cards: CardStack with subregions, capitals, leaders, etc..
 * cardIdToContent: mappings of Card.id to Card.content
 * subregionIdToContent: mappings of subregionId to Card.content
 * subregionNameToContent: mappings of subregionName to Card.content
 * start: start time
 * numSubregions: total number of subregions for the current region
 * remaining: number of cards remaining
 * pauseTime: total time spent paused
 * attempts: total number of guesses made
 * correct: total number of correct guesses made
 * lastPause: time of the last pause
 */
export interface GameplaySession {
  regionPath: string;
  cards: Card[];
  cardIdToContent: { [id: string]: string };
  cardIdToSubregionName: { [id: string]: string };
  subregionIdToContent: { [id: string]: string[] };
  subregionNameToId: { [name: string]: string };
  start?: number;
  numSubregions: number;
  remaining: number;
  pauseTime: number;
  attempts: number;
  correct: number;
  lastPause?: number;
}

export class Gameplay {
  /**
   * initializes a new Gameplay object, called when a new game is started
   * @param region the region the game will be played on
   * @param mode the type of game being played (subregion, capitals, leaders, etc...)
   * @param regionPath the path to the current region (used for flag images)
   */
  public static init(
    region: RegionGeoJson,
    mode: GameplayMode,
    regionPath: string
  ): GameplaySession {
    let cardStack: CardStack;
    switch (mode) {
      case GameplayMode.NAME:
        cardStack = new NameCardStack(region, regionPath);
        break;
      case GameplayMode.CAPITAL:
        cardStack = new CapitalCardStack(region, regionPath);
        break;
      case GameplayMode.LEADER:
        cardStack = new LeaderCardStack(region, regionPath);
        break;
      case GameplayMode.FLAG:
        cardStack = new FlagCardStack(region, regionPath);
        break;
      case GameplayMode.LANDMARKS:
        cardStack = new LandmarkCardStack(region, regionPath);
        break;
    }
    return {
      regionPath,
      cards: cardStack.getCards(),
      cardIdToContent: cardStack.getCardIdToContent(),
      cardIdToSubregionName: cardStack.getCardIdToSubregionName(),
      subregionIdToContent: cardStack.getSubregionIdToContent(),
      subregionNameToId: cardStack.getSubregionNameToId(),
      numSubregions: cardStack.length,
      remaining: cardStack.length,
      pauseTime: 0,
      attempts: 0,
      correct: 0,
    };
  }

  // the GameplaySession to be manipulated during this game
  public session: GameplaySession;

  /**
   * associates a GamePlaySession with this instance of Gameplay
   * @param session the session to be associated with this Gameplay
   */
  public constructor(session: GameplaySession) {
    this.session = session;
  }

  /**
   * Starts the current Gameplay
   * sets session.start to the current time
   */
  public startGame() {
    this.session.start = Date.now();
  }

  /**
   * Checks if the guess is correct or not. Returns true if correct, otherwise false
   * @param cardId the Card.id for the correct answer
   * @param subregionId the subregionId for the current guess
   */
  public check(cardId: string, subregionId: string): boolean {
    this.session.attempts++;
    let subregionContent = this.session.subregionIdToContent[subregionId];
    if (
      subregionContent &&
      subregionContent.includes(this.session.cardIdToContent[cardId])
    ) {
      delete this.session.cardIdToContent[cardId];
      this.session.correct++;
      this.session.remaining--;
      return true;
    }
    return false;
  }
  /**
   * returns the Subregion GeoJSON of the correct region for Learning Mode
   * @param cardId the Card.id for the correct answer
   * @returns
   */

  public getSubregionNameByCardId(cardId: string): string {
    return this.session.cardIdToSubregionName[cardId];
  }

  public getSubregionIdByCardId(cardId: string): string {
    let subregionName = this.getSubregionNameByCardId(cardId);
    return this.getSubregionId(subregionName);
  }

  /**
   * Checks if an area moused over is the correct subregion, does not modify game session data
   * @param cardId the Card.id for the correct answer
   * @param subregionId the subregionId for the current guess
   */
  public verify(cardId: string, subregionId: string): boolean {
    let subregionContent = this.session.subregionIdToContent[subregionId];
    if (
      subregionContent &&
      subregionContent.includes(this.session.cardIdToContent[cardId])
    ) {
      return true;
    }
    return false;
  }

  /**
   * Skips the card with the given id. Deletes the mapping of cardIdToContent for the
   * given id. Counts as an attempt
   * @param id Card.id of card to be "removed"
   */
  public skip(id: string): void {
    delete this.session.cardIdToContent[id];
    this.session.attempts++;
    this.session.remaining--;
  }

  /**
   * checks if the game is over yet. Returns true if session.remaining is greater than
   * zero, otherwise false.
   */
  public gameover(): boolean {
    return this.session.remaining <= 0;
  }

  /**
   * returns GameInfo object with information from this.session
   */
  public getGameInfo(): GameInfo {
    return {
      numSubregions: this.session.numSubregions,
      correctPercentage:
        Math.ceil((this.session.correct / this.session.attempts) * 10000) / 100,
      seconds: Math.floor(
        (Date.now() - this.session.start - this.session.pauseTime) / 1000
      ),
      correct: this.session.correct,
      incorrect: this.session.attempts - this.session.correct,
    };
  }

  /**
   * returns this.session.regionPath
   */
  public getRegionPath(): string {
    return this.session.regionPath;
  }

  /**
   * Pauses the game.
   * Sets this.session.lastPause to the current time
   */
  public pause() {
    if (!this.session.lastPause) this.session.lastPause = Date.now();
  }

  /**
   * Unpases the game.
   * Increments the pause time by how long the game was spent paused
   */
  public unpause() {
    if (this.session.lastPause) {
      this.session.pauseTime += Date.now() - this.session.lastPause;
      this.session.lastPause = null;
    }
  }

  /**
   * Given the name of the subregion, returns the id of the subregion
   * @param subregionName name of the subregion to find the id of
   */
  public getSubregionId(subregionName: string) {
    return this.session.subregionNameToId[subregionName];
  }
}
