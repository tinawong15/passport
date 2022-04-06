import { AudioManager, MusicId } from '../managers/AudioManager';
import { ScreenManager } from '../managers/ScreenManager';
import {Screen} from './Screen';
export class SplashScreen extends Screen {
    public constructor(queries:URLSearchParams) {
        super(ScreenManager.SPLASH, false, queries);
    }

    public ready():void {
        super.ready();
        $('.new-breadcrumb').remove();
        AudioManager.get().playMusic(MusicId.NAV);
    }
}
