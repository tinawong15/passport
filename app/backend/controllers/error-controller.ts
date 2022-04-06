/**
 * Routing controls for Error Handling
 */
import * as express from 'express';

export = function(env:string){
    const router = express.Router();
    // catch 404 and forward to error handler
    // no handler "screens" calls next(), so if it is a valid url, the request won't reach this route
    router.use(function(req:any, res:any, next:(err?:any)=>void) {
        let err:any = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    if (env === 'development') {
        router.use(function(err:any, req:any, res:any, next:(err?:any)=>void) {
            //TODO Add logging
            res.status(err.status || 500);
            res.render('404', {
                message: err.message,
                error: err,
                title: 'Page Not Found',
            });
        });
    }
    else {
        router.use(function(err:any, req:any, res:any, next:(err?:any)=>void) {
            //TODO Add logging
            res.status(err.status || 500);
            res.render('404', {
                message: err.message,
                error: {},
                title: 'Page Not Found',
            });
        });
    }
    return router;
}