import { AudioManager, SoundId } from '../managers/AudioManager';

export class Passport {
    private static readonly aspectRatio: number = 1534 / 1080;

    private passport: any;
    private pages: PassportPage[];
    private height: number;
    private width: number;
    private mid: number;
    private currentLeftPageNumber: number;
    private currentRightPageNumber: number;

    public constructor( attachHandler:
        (selector:any, event:string, handler:(e?:JQueryEventObject)=>void)=>void) {
        attachHandler('#passport-cover', 'click', function () {
            this.passport.turn("next");
        }.bind(this));
        this.currentLeftPageNumber = 0;
        this.currentRightPageNumber = 0;

        let passportScreen = $('#passport-screen');
        let screenWidth = passportScreen.width();
        let screenHeight = passportScreen.height();
        if (screenWidth / screenHeight > Passport.aspectRatio) {
            this.height = screenHeight * .8;
            this.width = this.height * Passport.aspectRatio;
        }
        else {
            this.width = screenWidth * .8;
            this.height = this.width / Passport.aspectRatio;
        }

        this.passport = $('#passport');
        this.pages = [null] // Page Numbers start at 1
        this.passport.children().each((index:number, elem:HTMLElement) => {
            let pageNum = index + 1;
            let $elem = $(elem);
            let content = $elem.find('.double-pager');
            let isDouble = false;
            if (content.length) {
                content.detach().appendTo('#passport-screen');
                isDouble = true;
            }
            else {
                content = $elem.find('.content');
            }
            let tabButton = $elem.find('.passport-nav-button');
            let tab: PassportTab = null;
            if (tabButton.length) {
                tab = new PassportTab(pageNum, tabButton);
                tabButton.detach().appendTo('#passport-screen');
                attachHandler(tabButton, 'click', function () {
                    this.passport.turn("page", pageNum);
                }.bind(this));
            }
            this.pages.push(new PassportPage(pageNum, isDouble, content, tab));
        });

        this.passport.turn({
            height: this.height,
            width: this.width,
            autoCenter: true
        });

        this.passport.bind('turning', (event:any, newPageNumber:number, view:any)=>{
            let leftPageNumber = Math.max(1, newPageNumber - newPageNumber % 2); // if odd, go back 1, unless on cover page
            let rightPageNumber = newPageNumber + (1 - newPageNumber % 2); // if even, go forward 1

            AudioManager.get().playSound(SoundId.PAGE_TURN)
            this.updateTabs(leftPageNumber);

            if (this.pages[this.currentLeftPageNumber] && this.pages[this.currentLeftPageNumber].isDouble()) {
                this.pages[this.currentLeftPageNumber].content.slideUp();
            }
            if (this.pages[this.currentRightPageNumber] && this.pages[this.currentRightPageNumber].isDouble()) {
                this.pages[this.currentRightPageNumber].content.slideUp();
            }

            if (this.pages[leftPageNumber] && this.pages[leftPageNumber].isDouble()) {
                this.pages[leftPageNumber].content.slideDown();
            }
            if (this.pages[rightPageNumber] && this.pages[rightPageNumber].isDouble()) {
                this.pages[rightPageNumber].content.slideDown();
            }

            this.currentLeftPageNumber = leftPageNumber;
            this.currentRightPageNumber = rightPageNumber;
        });

        let doublePagerCSS = {
            display: 'none',
            height: this.height * .9,
            width: this.width * .85,
            left: this.passport.position().left,
            top: this.passport.position().top,
            transform: `translate(${ (100/.85 - 100)/2 }%, ${ 100/.9 - 100 }%)`,
            position: 'fixed',
            'z-index': 2000
        }

        for (let page of this.pages) {
            if (page && page.isDouble()) {
                page.css(doublePagerCSS)
            }
        }

        // THE PASSPORT WIDTH AND HEIGHT ARE NOW KNOWN, USE
        // THOSE NUMBERS TO CALCULATE THE APPROPRIATE LOCATIONS
        // FOR THE TABS BOTH FOR WHEN THE PASSPORT IS OPEN
        // AS WELL AS WHEN IT IS CLOSED
        let passportTop = this.passport.position().top;    // TOP EDGE OF PASSPORT
        let passportLeft = this.passport.position().left;  // LEFT EDGE OF PASSPORT
        let Y_SHIFT = this.height * .01;            // AMOUNT TO SHIFT TABS DOWN
        this.mid = passportLeft + (this.width / 2);    // MID VERTICAL ON PASSPORT
        let tabWidth = (this.width / PassportTab.TAB_SIZE_DIVISOR);
        let tabHeight = this.height * PassportTab.DEFAULT_TAB_HEIGHT_SCALAR;
        let col1Left = this.mid - (3 * tabWidth / 2);
        let col2Left = this.mid - (tabWidth / 2);
        let col3Left = this.mid + (tabWidth / 2);
        let col4Left = this.mid + (this.width / 4) + tabHeight;
        let row1Top = passportTop - tabHeight + Y_SHIFT;
        let row2Top = passportTop + ((this.height - (3*tabWidth))/2);
        let row3Top = row2Top + tabWidth;
        let row4Top = row3Top + tabWidth;
        let row5Top = passportTop + this.height + Y_SHIFT;
        let col1MirrorTranslate = (3*tabWidth/2) - (tabWidth/2);
        let col2MirrorTranslate = (3*tabWidth/2) - (tabWidth*5/2)
                                + (tabWidth/PassportTab.TAB_SIZE_DIVISOR);
        let col3MirrorTranslate = (3*tabWidth/2) - (tabWidth*9/2)
                                + (tabWidth/PassportTab.TAB_SIZE_DIVISOR);
        let col4MirrorTranslate = (3*tabWidth/2) - (tabHeight) - (this.width);
        // INIT ALL THE PASSPORT TAB VALUES
        // TODO make this dynamic
        this.pages[2].tab.setPosition(col1Left, row1Top, 0, tabWidth, tabHeight, col1MirrorTranslate);
        this.pages[4].tab.setPosition(col2Left, row1Top, 0, tabWidth, tabHeight, col2MirrorTranslate);
        this.pages[6].tab.setPosition(col3Left, row1Top, 0, tabWidth, tabHeight, col3MirrorTranslate);
        this.pages[8].tab.setPosition(col4Left, row2Top, 90, tabWidth, tabHeight, col4MirrorTranslate);
        this.pages[10].tab.setPosition(col4Left, row3Top, 90, tabWidth, tabHeight, col4MirrorTranslate);
        this.pages[12].tab.setPosition(col4Left, row4Top, 90, tabWidth, tabHeight, col4MirrorTranslate);
        this.pages[14].tab.setPosition(col1Left, row5Top, 0, tabWidth, tabHeight, col1MirrorTranslate);
        this.pages[16].tab.setPosition(col2Left, row5Top, 0, tabWidth, tabHeight, col2MirrorTranslate);
        this.pages[20].tab.setPosition(col3Left, row5Top, 0, tabWidth, tabHeight, col3MirrorTranslate);

        this.updateTabs(1);
        this.currentLeftPageNumber = 1;
        this.currentRightPageNumber = 1;
    }

    public updateTabs(newLeftPageNumber:number):void {
        // THINGS WE HAVE TO BE ABLE TO DO
        // 1) MOVE TAB TO RIGHT FROM CLOSED TO OPEN
        // 2) MOVE TAB TO LEFT FROM CLOSED TO OPEN AND ROTATED
        // 3) MOVE TAB TO LEFT FROM OPEN TO OPEN AND ROTATED
        // 4) MOVE TAB TO RIGHT FROM OPEN AND ROTATED TO OPEN
        // 5) MAKE SELECTED TAB BIGGER OR Z-ORDER?
        // 6) MAKE DESELCTED TAB SMALLER
        // 7) MAKE BOTTOM TAB ALWAYS 180 ROTATED AND TEXT 180 ROTATED
        // ON TOP OF THAT SO IT APPERAS AT BOTTOM OF TAB?

        // IF WE WERE ON THE COVER PAGE WE NEED TO MOVE ALL
        // THE TABS. SOME WILL NEED TO MOVE ONLY TO THE
        // RIGHT, SOME WILL NEED TO MOVE TO THEIR RIGHT
        // POSITION MINUS 2x THEIR DISTANCE FROM THE
        // CENTER AND ROTATE AND MAKE THE SELECTED ONE
        // BIGGER

        // WE WERE ON THE PASSPORT COVER PAGE
        if (this.currentLeftPageNumber === 1) {
            // FIRST CORRECT ALL THE PAGE TABS SO IT'S OPEN
            for (let page of this.pages) {
                // MOVE TAB TO RIGHT
                if (page && page.tab)
                    page.tab.move(TabPosition.OPEN_RIGHT, this.width);
            }
        }
        // WE ARE GOING TO THE PASSPORT COVER PAGE
        else if (newLeftPageNumber === 1) {
            // MOVE ALL THE TABS BACK TO THEIR DEFAULT POSITIONS
            for (let page of this.pages) {
                // MOVE TAB TO CLOSED LOCATION
                if (page && page.tab)
                    page.tab.move(TabPosition.CLOSED, this.width);
            }
        }

        // WE ARE ONLY INTERESTED IN PAGE TURNING IF WE
        // ARE NOT TURNING TO THE FRONT PAGE
        if (newLeftPageNumber > 1) {
            // NOW FIGURE OUT THE TABS THAT NEED TO BE TURNED
            if (this.currentLeftPageNumber < newLeftPageNumber) {
                // WE ARE MOVING FORWARD
                for (let i = this.currentLeftPageNumber; i < newLeftPageNumber; i++) {
                    if (this.pages[i] && this.pages[i].tab)
                        this.pages[i].tab.turn(TabPosition.OPEN_LEFT, this.width);
                }
            }
            else {
                // WE ARE MOVING BACKWARD
                for (let i = this.currentLeftPageNumber; newLeftPageNumber <= i; i--) {
                    if (this.pages[i] && this.pages[i].tab)
                        this.pages[i].tab.turn(TabPosition.OPEN_RIGHT, this.width);
                }
            }
        }

        // NOW MAKE SURE THE PREVIOUSLY SELECTED PAGE TAB IS MADE NORMAL AGAIN
        let currentTab = this.pages[this.currentLeftPageNumber] && this.pages[this.currentLeftPageNumber].tab;
        if (currentTab) currentTab.deselect(this.height);
        let newTab = this.pages[newLeftPageNumber] && this.pages[newLeftPageNumber].tab;
        if (newTab) newTab.select(this.height);
    }
}

class PassportPage {
    private pageNum: number;
    private double: boolean;

    private _content:JQuery;
    set content(_:JQuery){}
    get content():JQuery {
        return this._content
    }

    private _tab: PassportTab;
    set tab(_:PassportTab){}
    get tab():PassportTab {
        return this._tab;
    }

    constructor(pageNum:number, double: boolean, content:JQuery, tab:PassportTab) {
        this._content = content;
        this.pageNum = pageNum;
        this.double = double;
        this._tab = tab;
    }

    public isDouble():boolean {
        return this.double;
    }

    public css(css:JQueryCssProperties) {
        this.content.css(css);
    }
}

enum TabPosition {
    OPEN_LEFT,
    OPEN_RIGHT,
    CLOSED
}

class PassportTab {
    public static readonly TAB_SIZE_DIVISOR = 8;
    public static readonly DEFAULT_TAB_HEIGHT_SCALAR = .1;
    private static readonly SELECTED_TAB_HEIGHT_SCALAR = .12;
    private static readonly DEFAULT_Z_INDEX = -1;
    private static readonly SELECTED_Z_INDEX = 1;

    public pageNumber: number;
    public left: number;
    public top: number;
    public mirrorTranslate : number;
    public angle: number;
    public width: number;
    public height: number;

    private button: JQuery;

    constructor(pageNumber: number, button: JQuery) {
        this.pageNumber = pageNumber;
        this.button = button;
    }

    public setPosition(left:number, top:number, angle:number, width:number, height:number, mirrorTranslate:number) {
        this.left = left;
        this.top = top;
        this.mirrorTranslate = mirrorTranslate;
        this.angle = angle;
        this.width = width;
        this.height = height;

        this.button.css({
            "left": this.left,
            "top": this.top,
            "width": this.width,
            "height": this.height,
            "transform": `rotate(" + ${ this.angle } + "deg)`,
            "transform-origin": "top left"
        });
    }

    public turn(pos:TabPosition, width:number):void {
        let scaleText = " scale(1,1)";
        let translate = 3*this.width/2 + width/(2*PassportTab.TAB_SIZE_DIVISOR);
        if (pos === TabPosition.OPEN_LEFT) {
            scaleText = " scale(-1,1)"
            translate = this.mirrorTranslate;
        }
        this.button.css({
            'transition': "transform .25s",
            'transform': 'translateX(' + translate + "px)"
                + scaleText
                //+ " rotateY(" + rotate + "deg)"
                + " rotateZ(" + this.angle + "deg)"
        });
    }

    public move(pos:TabPosition, width:number) {
        let xTranslate = 0;
        if (pos === TabPosition.OPEN_RIGHT) {
            xTranslate = 3*this.width/2 + width/(PassportTab.TAB_SIZE_DIVISOR*2);
        }
        let transformText = 'translateX(' + xTranslate + 'px)'
                         + ' rotate(' + this.angle + 'deg)';
        this.button.css({
            'transform': transformText
        });
    }

    public select(height:number) {
        this.button.css({
            "height": height * PassportTab.SELECTED_TAB_HEIGHT_SCALAR,
            "z-index": PassportTab.SELECTED_Z_INDEX
        });
    }

    public deselect(height:number) {
        this.button.css({
            "height": height * PassportTab.DEFAULT_TAB_HEIGHT_SCALAR,
            "z-index": PassportTab.DEFAULT_Z_INDEX
        });
    }
}
