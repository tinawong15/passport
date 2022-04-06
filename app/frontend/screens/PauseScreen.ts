import { ScreenManager } from '../managers/ScreenManager';
import { UserManager } from '../managers/UserManager';
import { GameplayManager } from '../managers/GameplayManager';
import { Overlay } from './Overlay';
export class PauseScreen extends Overlay {
    public constructor(queries:URLSearchParams) {
        super(ScreenManager.PAUSE, queries);
    }

    public ready():void {
        super.ready();
        $('#playpause-button').removeClass('mdi-pause').addClass('mdi-play');

        this.attachHandler('#play-button', 'click', function () {
            $('#playpause-button').removeClass('mdi-play').addClass('mdi-pause');

            ScreenManager.get().closeOverlay();
            GameplayManager.get().resume();
        }.bind(this));
    }
}
