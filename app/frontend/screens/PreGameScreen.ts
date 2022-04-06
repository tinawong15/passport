import { UserManager } from '../managers/UserManager';
import { ScreenManager } from '../managers/ScreenManager';
import { GameplayManager } from '../managers/GameplayManager';
import { Overlay } from './Overlay';
export class PreGameScreen extends Overlay {
    public constructor(queries:URLSearchParams) {
        super(ScreenManager.PREGAME, queries);
    }

    public ready():void {
        super.ready();

        this.attachHandler('#play-button', 'click', function () {
            var button = $('#playpause-button');
            button.removeClass('mdi-play');
            button.addClass('mdi-pause');

            ScreenManager.get().closeOverlay();
            GameplayManager.get().start();
        }.bind(this));

        if (this.isDataLoaded)
            $('#play-button').removeAttr('disabled');
        else
            Object.defineProperty(this, 'isDataLoaded', {
                configurable: true,
                get: function() {
                    return this._isDataLoaded;
                },
                set: function(isDataLoaded: boolean) {
                    this._isDataLoaded = isDataLoaded;
                    if (isDataLoaded)
                        $('#play-button').removeAttr('disabled');
                }
            });
    }
}
