import { Overlay } from "./Overlay";
import { Region } from "../components/Region";
import { ScreenManager } from "../managers/ScreenManager";
import { AudioManager, SoundId } from "../managers/AudioManager";
import { UserManager } from "../managers/UserManager";
import { CookieKey, CookieManager } from "../managers/CookieManager";
import {Passport} from '../components/Passport';

export class PassportScreen extends Overlay {
    private passport: Passport;

    public constructor(queries: URLSearchParams) {
        super(ScreenManager.PASSPORT, queries);
    }

    public ready(): void {

        super.ready();
        this.passport = new Passport(this.attachHandler.bind(this));


        this.attachHandler('#passport-screen', 'click', function (e: JQueryEventObject) {
            if ($(e.target).attr('id') == 'passport-screen') // If clicked the passport-screen itself, not its children
                ScreenManager.get().closeOverlay();
        });

        this.attachHandler('#music-slider', 'change', function (e: JQueryEventObject) {
            CookieManager.get().setCookie(CookieKey.MUSIC_VOL, $(e.target).val().toString());
            AudioManager.get().setMusicVol($(e.target).val());
        });

        this.attachHandler('#sound-slider', 'change', function (e: JQueryEventObject) {
            CookieManager.get().setCookie(CookieKey.SOUND_VOL, $(e.target).val().toString());
            AudioManager.get().setSoundVol($(e.target).val());
        });

        this.attachHandler('#music-slider + .thumb .value', 'change', function (e: JQueryEventObject) {
            AudioManager.get().setMusicVol(parseInt($(e.target).text())); // update music in real time
        });

        $('#music-slider').val(CookieManager.get().getCookie(CookieKey.MUSIC_VOL));
        $('#sound-slider').val(CookieManager.get().getCookie(CookieKey.SOUND_VOL));
    }

    public dataLoaded(region: Region): void { }

    protected passportClicked(): void {
        ScreenManager.get().closeOverlay();
    }
}
