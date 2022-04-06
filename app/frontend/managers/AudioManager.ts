import { CookieKey, CookieManager } from "./CookieManager";

class SoundEvent {
    soundId:SoundId;
    sound:HTMLAudioElement;
    event:string;
    handler:(e:JQueryEventObject)=>void;
}

export enum MusicId {
    NAV = 'nav',
    VICTORY_LONG = 'victory_long',
    VICTORY_MED = 'victory_med',
    VICTORY_SHORT = 'victory_short',
    VICTORY_MIX_1 = 'victory_mix_1',
    VICTORY_MIX_2 = 'victory_mix_2',
    VICTORY_MIX_3 = 'victory_mix_3',
    VICTORY_MIX_4 = 'victory_mix_4',
    VICTORY_MIX_5 = 'victory_mix_5',
}

export enum SoundId {
    AIRPLANE_LAND = 'airplane_land',
    AIRPLANE_PASS = 'airplane_pass',
    CAR_START = 'car_start',
    CLICK = 'click',
    ENGINE_FAIL = 'engine_fail',
    ENGINE_FAIL_ALT = 'engine_fail_alt',
    PAGE_TURN = 'page_turn',
    STAMP = 'stamp',
    SWOOSH = 'swoosh',
    TRAIN_PASS = 'train_pass',
    TRAIN_WHISTLE = 'train_whistle',
    TYPING = 'typing'
}

export class AudioManager {
    private static audioManager:AudioManager;
    public static get():AudioManager{
        if (!this.audioManager)
            this.audioManager = new AudioManager();
        return this.audioManager;
    }
    private static readonly defaultVol:number = 50;

    private muted:boolean = true; // Chrome doesn't like unmuted audio playing before user interaction

    private musicVol: number;
    private soundVol: number;

    private currentMusicId:MusicId;
    private music:Map<MusicId, HTMLAudioElement>;

    private $sounds:Map<SoundId, JQuery>;
    private soundEvents:Map<HTMLElement, SoundEvent>;

    private constructor() {
        let cookieManager:CookieManager = CookieManager.get();
        this.setMusicVol(parseInt(cookieManager.getCookie(CookieKey.MUSIC_VOL)));
        if (isNaN(this.musicVol)) {
            this.setMusicVol(AudioManager.defaultVol);
            cookieManager.setCookie(CookieKey.MUSIC_VOL, AudioManager.defaultVol.toString());
        }
        this.setSoundVol(parseInt(cookieManager.getCookie(CookieKey.SOUND_VOL)));
        if (isNaN(this.soundVol)) {
            this.setSoundVol(AudioManager.defaultVol);
            cookieManager.setCookie(CookieKey.SOUND_VOL, AudioManager.defaultVol.toString());
        }

        this.music = new Map();
        $('.music').each(function(index:number, music:HTMLAudioElement) {
            let $music = $(music);
            this.music.set($music.attr('id'), music);
        }.bind(this));

        this.$sounds = new Map();
        $('.sound').each(function(index:number, sound:HTMLAudioElement) {
            let $sound = $(sound);
            this.$sounds.set($sound.attr('id'), $sound);
        }.bind(this));

        this.soundEvents = new Map();

        let unmute = function() {
            this.muted = false;
            if (this.currentMusicId && this.music.has(this.currentMusicId))
                this.music.get(this.currentMusicId).play();
            $(document).off('click', unmute);
        }.bind(this);
        $(document).on('click', unmute);
    }

    public playMusic(musicId:MusicId, restartCurrentMusic:boolean=true):void {
        if (musicId == this.currentMusicId && (this.music.get(musicId).loop || !this.music.get(musicId).ended))
            return;
        if (!this.music.has(musicId)) {
            let $music = $('#' + musicId);
            if ($music.length == 0) throw `No music with id ${musicId}`;
            this.music.set(musicId, <HTMLAudioElement>$music.get(0));
        }
        if (this.currentMusicId) 
            this.stopMusic(this.currentMusicId, restartCurrentMusic);
        this.currentMusicId = musicId;
        this.music.get(musicId).volume = this.musicVol;
        if (!this.muted)
            this.music.get(musicId).play();
    }

    public stopMusic(musicId:MusicId, restartCurrentMusic:boolean=true):void {
        if (this.currentMusicId == musicId) {
            this.music.get(musicId).pause();
            if (restartCurrentMusic)
                this.music.get(musicId).currentTime = 0;
            this.currentMusicId = null;
        }
    }

    public playSound(soundId:SoundId):void {
        if (!this.$sounds.has(soundId)) {
            let $sound = $('#' + soundId);
            if ($sound.length == 0) throw `No sound with id ${soundId}`;
            this.$sounds.set(soundId, $sound);
        }
        let sound = this.cloneSound(soundId);
        sound.volume = this.soundVol;
        sound.onended = function() {
            $(sound).remove();
        }
        sound.play();
    }

    public playRandomSound(...soundIds:SoundId[]):void {
        this.playSound(soundIds[Math.floor(Math.random()*soundIds.length)])
    }

    private cloneSound(soundId:SoundId):HTMLAudioElement {
        return <HTMLAudioElement>this.$sounds.get(soundId).clone().appendTo('#audios').attr('id', '').get(0);
    }

    public attachSoundEvent(selector:any, event:string, soundId:SoundId):void {
        let elems = $(selector);
        elems.each(function(index:number, elem:HTMLElement) {
            if (this.soundEvents.has(elem)) {
                let soundEvent:SoundEvent = this.soundEvents.get(elem);
                if (soundEvent.event == event && soundEvent.soundId == soundId)
                    return; // Same sound event, do nothing
                this.detachSoundEvent(elem); // Only one sound event allowed as of now
            }
            let sound:HTMLAudioElement = this.cloneSound(soundId);
            let soundEvent:SoundEvent = { soundId, sound, event, handler: function() {
                sound.volume = this.soundVol;
                sound.play();
            }.bind(this)};
            this.soundEvents.set(elem, soundEvent);
            $(elem).on(event, soundEvent.handler);
        }.bind(this));
    }

    public detachSoundEvent(selector:any):void {
        $(selector).each(function(index:number, elem:HTMLElement){
            if (this.soundEvents.has(elem)) {
                let soundEvent:SoundEvent = this.soundEvents.get(elem);
                $(elem).off(soundEvent.event, soundEvent.handler);
                $(soundEvent.sound).remove();
                this.soundEvents.delete(elem);
            }
        }.bind(this));
    }

    public setMusicVol(vol:number):void {
        if (isNaN(vol)) return;
        this.musicVol = vol/100;
        if (this.currentMusicId)
            this.music.get(this.currentMusicId).volume = this.musicVol;
    }

    public setSoundVol(vol:number):void {
        if (isNaN(vol)) return;
        this.soundVol = vol/100;
    }
}