/**
 * Contains all the pages of the Passport
 */
export enum PassportPage {
    CREDENTIALS = 'CREDENTIALS',
    VISAS = 'VISAS',
    ITINERARY = 'ITINERARY',
    BOARD = 'BOARD',
    COMPANIONS = 'COMPANIONS',
    ARRANGEMENTS = 'ARRANGEMENTS',
    BROCHURE = 'BROCHURE',
    CABINET = 'CABINET',
    ADVISORIES = 'ADVISORIES'
}

/**
 * Contains the page name and page number, used as a return value
 */
export interface PassportInfo {
    passportPage: PassportPage,
    pageNum: Number
}

/**
 * Contains the page name and page number, used to store current page values
 */
export interface PassportSession {
    passportPage: PassportPage,
    pageNum: Number
}

/**
 * Used to store the current Passport status
 */
export class Passport {
    // current page name and page number
    public session:PassportSession;
    
    // sets the current session to the given session
    public constructor(passportSession:PassportSession) {
        this.session = passportSession;
    }

    /**
     * returns the current Passport page name and page number
     */
    public getPassportInfo():PassportInfo {
        return {
            passportPage: PassportPage.CREDENTIALS,
            pageNum: 1
        }
    }

} 