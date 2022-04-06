import * as express from 'express';
import path = require('path');
import admin = require('firebase-admin');
import * as Session from 'express-session';
declare module 'express-session' {
    export interface SessionData {
        authorized: boolean;
    }
}

const router = express.Router();

const serviceAccount = require(path.join(__dirname, '..', 'service-account-key.json'));
admin.initializeApp({
    projectId: 'regio-vinco',
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://regio-vinco.firebaseio.com"
});
var db = admin.firestore();

// checks if the password is valid
router.post('/authorize', function(req, res, next) {
    if (req.body.code == 'mozambique') {
        req.session.authorized = true;
        res.sendStatus(200);
        return;
    }
    res.sendStatus(401);
});

// visited when the site is first launched, checks if password is correct
router.get('/auth', function(req, res, next){
    res.render('auth', {
        title: 'Auth'
    });
});

// checks if 
router.all('*', function(req, res, next) {
    if (req.session.authorized) {
        next();
        return;
    }
    res.redirect('/auth')
});

export = {auth: router, db: db};
