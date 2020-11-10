const passportCallbacks = require('./passport')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require("express")
const app = express()
const session = require("express-session")
const db = require('./db').db
const apiPort = 4000

const mainRouter = require('./routes/mainRoutes.js')
const MongoStore = require('connect-mongo')(session);

/*
    Express.js configurations
*/

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    store: new MongoStore({ 
        mongooseConnection: db
    }),
    secret: ['295f1ed04984e77c336a3580c2ea1127ca89d1e658d1dd56be3be55cf0a95111',
    'cab33e57cdee3c516d0a47af34bdc47153daeffd6adab3293b88d0e61e603fde',
    '797e1f304f31b746836b99165ca281cee10612965cfdb8b65fb075c795c1aeb4',
    '3674c67d7cbb473b06f7b14bc22926b2a210b7586bcb14566513295f2d808a5c'
    ], //In practice, secrets should be stored out of codebase
    resave: false, //Prevents sessions from being saved, if unmodified
    saveUninitialized: false, //Prevents sessions from being saved, if nothing is stored
    cookie: { 
        secure: true 
    } 
}))
app.use(passport.initialize());
app.use(passport.session());

/*
    Passport.js configurations
*/
passport.use('local-login', new LocalStrategy({
    passReqToCallback : true
}, passportCallbacks.localLogIn));

passport.use('local-signup', new LocalStrategy({
    passReqToCallback : true
}, passportCallbacks.localSignUp));

passport.serializeUser(passportCallbacks.serialize)
passport.deserializeUser(passportCallbacks.deserialize)

/*
    Express.js routes
*/

authRouter = express.Router()

authRouter.post('/login', passport.authenticate('local-login', {
    successRedirect : '/main',
    failureRedirect : '/login',
    failureFlash : false
}))

authRouter.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/main',
    failureRedirect : '/signup',
    failureFlash : false
}))

authRouter.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.use('/auth', authRouter)
app.use('/main', mainRouter)

db.on('error', console.error.bind(console, "Error connecting to MongoDB Atlas Database:"))

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))