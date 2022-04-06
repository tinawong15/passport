import * as express from 'express';
import path = require('path');
import favicon = require('serve-favicon');
import logger = require('morgan');
import cookieParser = require('cookie-parser');
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import {FirestoreStore} from '@google-cloud/connect-firestore';

const app = express();

app.set('views', path.join(__dirname, '..', 'screens'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

import auth = require('./controllers/auth-controller');
import { SessionStore } from './managers/SessionStore';
app.use(session({
    store: SessionStore.set(auth.db, 'express-sessions'),
    secret: 'AndorraForTheWin', // TODO: Change to be outside of repo
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24*60*60*1000 + 1000
    }
}));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(favicon(path.join('app', 'public', 'img', 'favicon.ico')));

app.use(auth.auth);

import screens = require('./controllers/screen-controller');
app.use('/', screens);

import api = require('./controllers/api-controller');
app.use('/api', api);

import data = require('./controllers/data-controller');
app.use('/data', data);

import error = require('./controllers/error-controller');
app.use(error(app.get('env')));

import debug = require('debug');
debug('test:server');
import http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val:string) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error:any) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
