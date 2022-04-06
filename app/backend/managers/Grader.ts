import jsonfile = require('jsonfile');
import path = require('path');
import { GameInfo } from '../components/Gameplay';

/**
 * Used as a return value
 * grade: the current grade based on correct guesses so far (S+, S, etc...)
 * nextGrade: the next highest grade
 * score_req: the score required to get the next highest grade
 * time_req: the time required to get the next hights grade
 * rank: title given based on grade
 */
export interface GradeInfo {
    grade:string;
    nextGrade:string;
    score_req:number;
    time_req:number;
    rank:string;
}

/**
 * Handles all grading, follows Singleton design pattern.
 */
export class Grader {
    // the Grader object
    private static grader:Grader;

    /**
     * Returns the main Grader object, creates a new one if one does not yet exist
     */
    public static get():Grader {
        if (!this.grader)
            this.grader = new Grader();
        return this.grader;
    }

    // list of all possible grades
    private grades:string[];

    // mapping of grade to required score
    private score_reqs:{[grade:string]:number};

    // mapping of time requirements to required score
    private time_reqs:{[grade:string]:number};

    // mapping of grade to rank
    private ranks:{[grade:string]:string};

    // mapping of grade to index number
    private indices:{[grade:string]:number}

    /**
     * Constructs a Grader object using grades.json which gives specific information on the
     * possible grades, score requirements for each grade, time requirements for each grade, 
     * rank titles for each grade, and index mappings for each grade.
     */
    private constructor() {
        console.log(__dirname);
        let gradesJson = jsonfile.readFileSync(path.join(__dirname, '..', 'grades.json'));
        this.grades = gradesJson.grades;
        this.score_reqs = gradesJson.score_reqs;
        this.time_reqs = gradesJson.time_reqs;
        this.ranks = gradesJson.ranks;
        this.indices = {};
        for (let i=0; i<this.grades.length; i++) {
            this.indices[this.grades[i]] = i;
        }
    }

    /**
     * Calculates the current grade based on the current game statis and returns that
     * @param gameInfo information on the current game needed to calculate the grade
     */
    public calcGrade(gameInfo:GameInfo):GradeInfo {
        let i:number;
        for (i=0; i<this.grades.length; i++) {
            let grade = this.grades[i];
            if ((isNaN(this.score_reqs[grade])  || gameInfo.correctPercentage >= this.score_reqs[grade])
                && 
                (isNaN(this.time_reqs[grade])   || gameInfo.seconds <= gameInfo.numSubregions * this.time_reqs[grade]))
                break;
        }
        return {
            grade: this.grades[i],
            nextGrade: i == 0 ? null : this.grades[i-1],
            score_req: i == 0 ? null : this.score_reqs[this.grades[i-1]],
            time_req:  i == 0 ? null : this.time_reqs[this.grades[i-1]] * gameInfo.numSubregions,
            rank: this.ranks[this.grades[i]]
        }
    }

    /**
     * returns the rank for a given grade
     * @param grade the grade to find the rank title of
     */
    public getRank(grade:string):string {
        return this.ranks[grade];
    }

    /**
     * returns the next highest possible grade, returns null if already the highest grade
     * @param grade the grade to find the next highest grade of
     */
    private getNextGrade(grade:string):string {
        let i = this.indices[grade] - 1;
        if (i < 0)
            return null;
        return this.grades[i];
    }

    /**
     * returns the minimum score requirement needed to achieve the given grade
     * @param grade the grade to find the score requirement of
     */
    public getScoreReq(grade:string):number {
        return this.score_reqs[grade];
    }

    /**
     * returns the minimum time requirement needed to achieve the given grade
     * @param grade the grade to find the time requirement of
     */
    public getTimeReq(grade:string):number {
        return this.time_reqs[grade];
    }

    /**
     * returns the higher of the 2 given grades
     * @param grade1 first grade to be compared
     * @param grade2 second grade to be compared
     */
    public max(grade1:string, grade2:string):string {
        return (this.indices[grade1] < this.indices[grade2]) ? grade1 : grade2;
    }
}