/**
 * Primary frontend script
 * main.js
 *
 * Wisteria Life
 *
 * Depends on Browserify for node.js style requires
 *
 * This is frontend only.
 */

/*
 * Test Screens
 */
import {ScreenManager} from './managers/ScreenManager';
import {UserManager} from './managers/UserManager';

/**
 * Instantiate navbar events
 *
 * All screen specific events should be moved to load() methods
 */
$(document).ready(function() {

    $('#hamburger-vert').dropdown();

    let userManager = UserManager.get();

    $('#loading-overlay').fadeIn('fast');

    ScreenManager.get().setupInitScreen();

    $('.login-button').click(function () {
        userManager.handleLogin();
    });

    $('.logout-button').click(function () {
        userManager.handleSignOut();
    });

});

// Preload images
new Image().src = "img/passport.png";