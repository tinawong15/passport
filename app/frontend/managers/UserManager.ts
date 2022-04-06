import {ScreenManager} from './ScreenManager';

// TODO - Make this typescript, setup typings for firebase
declare var firebase: any;

/**
 * Singleton Game Manager
 *
 * Manages all aspects of game data and backend components
 * The starting point of Regio Vinco
 */
export class UserManager {
    private static userManager:UserManager;
    public static get():UserManager {
        if (!this.userManager) 
            this.userManager = new UserManager();
        return this.userManager;
    }

    public user:any;
    public auth: any;
    public userDisplay:any;

    private constructor() {
        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyBthX3LA3sbZx3lyKWcJhnz-qpyNdNybL0",
            authDomain: "regio-vinco.firebaseapp.com",
            databaseURL: "https://regio-vinco.firebaseio.com",
            projectId: "regio-vinco",
            storageBucket: "regio-vinco.appspot.com",
            messagingSenderId: "828272270550"
        };

        firebase.initializeApp(config);
        this.auth = firebase.auth();

        this.userDisplay = {
            name: $('.username'),
            avatar: $('.user-pic'),
            defaultAvatar: $('.user-icon-def'),
            avatarWrapper: $('.user-icon-pic'),
            login: $('.login-button'),
            logout: $('.logout-button')
        }

        firebase.auth().onAuthStateChanged(function (user: any) {
            if (user) {
                this.userDisplay.name.text(user.displayName);
                this.userDisplay.defaultAvatar.hide();
                this.userDisplay.avatar.attr('src', user.photoURL);
                this.userDisplay.login.hide();
                this.userDisplay.logout.show();
                this.userDisplay.avatarWrapper.show();

                // get user GameData from databaseURL
                firebase.database().ref('users/' + user.uid).once('value', function (snapshot: any) {
                    var exists = snapshot.val() != null;
                    this.userDatabaseCallback(user, exists, snapshot.val());
                }.bind(this));

            } else {
                this.userDisplay.name.text("Guest");
                this.userDisplay.avatar.attr('src', '');
                this.userDisplay.defaultAvatar.show();
                this.userDisplay.login.show();
                this.userDisplay.logout.hide();
                this.userDisplay.avatarWrapper.hide();
            }
        }.bind(this));
    }

    userDatabaseCallback(user: any, exists: boolean, data: any) {
    }

    writeUserData() {
    }

    handleLogin() {
        var provider = new firebase.auth.GoogleAuthProvider();
        this.auth.signInWithPopup(provider).then(
            function (result : any): any {
                // This gives you a Google Access Token. You can use it to access the Google API.
                var token = result.credential.accessToken;
                // The signed-in user info.
                var user = result.user;

                console.log(user);

                // set UI elements
                $('.username').text(user.displayName);

            }).catch(function (error : any): any {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;

            });
    }

    handleSignOut() {
        this.auth.signOut().then(function () {
            // Sign-out successful.
        }, function (error: string) {
            // An error happened.
        });
    }
}
