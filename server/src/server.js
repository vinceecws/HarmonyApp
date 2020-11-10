require('dotenv').config()

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
    secret: process.env.MONGO_STORE_SESSION_SECRET.split(' '),
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

app.use(passportCallbacks.isLoggedIn)

app.use('/auth', authRouter)
app.use('/main', mainRouter)

db.on('error', console.error.bind(console, "Error connecting to MongoDB Atlas Database:"))

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))