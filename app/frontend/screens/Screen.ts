import { ScreenEnum, ScreenManager } from '../managers/ScreenManager';
import { AudioManager, SoundId } from '../managers/AudioManager';
import { UserManager } from '../managers/UserManager';

export abstract class Screen {

    name: ScreenEnum;
    overlay: boolean;
    property: string;
    queries: URLSearchParams;

    private handlers: Map<any, Map<string, {(e?:JQueryEventObject):void}[]>>;
    private attached:boolean;

    protected constructor(name:ScreenEnum, overlay:boolean, queries:URLSearchParams) {
        this.name = name;
        this.overlay = overlay;
        this.queries = queries;

        this.handlers = new Map<any, Map<string, {(e?:JQueryEventObject):void}[]>>();
        this.attached = true;
    }


    public ready():void {
        AudioManager.get().attachSoundEvent('.stamp-button', 'click', SoundId.STAMP);
        this.attachHandler('.breadcrumb', 'click', () => {
            AudioManager.get().playRandomSound(SoundId.AIRPLANE_LAND, SoundId.AIRPLANE_PASS, SoundId.TRAIN_PASS, SoundId.TRAIN_WHISTLE, SoundId.CAR_START);
        });
        this.attachHandler('#toggle-passport', 'click', this.passportClicked.bind(this));
    }

    /**
     * Tasks to perform when user leaves a screen
     */
    public onLeave():void {
        this.detachHandlers();
    }

    public attachHandler(selector:any, event:string, handler:(e?:JQueryEventObject)=>void):void {
        if (!this.handlers.has(selector)) {
            this.handlers.set(selector, new Map<string, {(e?:JQueryEventObject):void}[]>());
        }
        let eventHandlers = this.handlers.get(selector);
        if (!eventHandlers.has(event)) {
            eventHandlers.set(event, []);
        }
        eventHandlers.get(event).push(handler);

        if (this.attached)
            $(selector).on(event, handler);
    }

    public detachHandlers():void {
        this.attached = false;
        for (let [selector, eventHandlers] of this.handlers) {
            for (let [event, handlers] of eventHandlers) {
                for (let i=0; i<handlers.length; i++){
                    $(selector).off(event, handlers[i]);
                }
            }
        }
    }

    public reattachHandlers():void {
        this.attached = true;
        for (let [selector, eventHandlers] of this.handlers) {
            for (let [event, handlers] of eventHandlers) {
                for (let i=0; i<handlers.length; i++) {
                    $(selector).on(event, handlers[i]);
                }
            }
        }
    }

    protected passportClicked():void {
        ScreenManager.get().switchScreens(ScreenManager.PASSPORT, new URLSearchParams(window.location.search));
    }

    public error():void {}
}
