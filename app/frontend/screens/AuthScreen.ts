import { Screen } from './Screen';
import { ScreenManager } from '../managers/ScreenManager';
import { toast } from '../components/toast';

declare var M:any;
export class AuthScreen extends Screen {
    private code:JQuery;

    public constructor(queries:URLSearchParams) {
        super(ScreenManager.AUTH, false, queries);
    }

    public ready():void {
        this.code = $('#code-input');
        this.attachHandler('#submit-code', 'click', this.submit.bind(this));
        this.attachHandler('#code-input', 'keypress', function(e: JQueryEventObject) {
            if (e.which == 13) this.submit();
        }.bind(this));
    }

    private submit():void {
        $.ajax({
            url: '/authorize',
            method: 'POST',
            data: {
                code: this.code.val()
            },
            error(xhr:JQueryXHR, status:string, err:string) {
                toast('Invalid Code', true);
            },
            success(data:any) {
                ScreenManager.get().switchScreens(ScreenManager.SPLASH, new URLSearchParams(), true);
            }
        });
    }
}
