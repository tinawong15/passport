export enum CookieKey {
    MUSIC_VOL = 'musicVol',
    SOUND_VOL = 'soundVol'
}

export class CookieManager {
    private static cookieManager:CookieManager;
    public static get():CookieManager {
        if (!this.cookieManager)
            this.cookieManager = new CookieManager();
        return this.cookieManager;
    } 

    private cookies: {[key in CookieKey]?:string}
    
    private constructor() {
        this.cookies = {};
        for (let cookieString in decodeURIComponent(document.cookie).split(';')) {
            let [cookieKey, cookieValue] = cookieString.split('=');
            if (cookieKey && cookieValue)
                this.cookies[<CookieKey>cookieKey.trim()] = cookieValue;
        }
    }

    public setCookie(key:CookieKey, value:string):void {
        document.cookie = `${key}=${value};`;
        this.cookies[key] = value;
    }

    public getCookie(key:CookieKey):string {
        return this.cookies[key];
    }
}