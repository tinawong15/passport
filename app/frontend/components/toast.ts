/**
 * Display an onscreen toast message
 *
 * Error messages are limited to one on-screen at any given time,
 * so adding a message will remove previous ones.
 *
 * @param  {String} message     Message to display
 * @param  {boolean} error      whether or not its an error
 * @param  {Number} [duration]  duration in milliseconds
 */
export function toast(message:string, error:boolean, duration:number = 4000):void {
    var className = error ? 'wisteria-error-toast' : 'wisteria-toast';

    // remove all existing error toasts
    if (error)
        $('.wisteria-error-toast').remove();

    Materialize.toast(message, duration, className);
}
