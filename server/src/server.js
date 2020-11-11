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
const mongooseQuery = require('./db');

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

authRouter.post('/login/signup', passport.authenticate('local-signup', {
    successRedirect : '/main',
    failureRedirect : '/login/signup',
    failureFlash : false
}))

authRouter.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});


mainRouter.get('/profile/:id', async (req, res) => {
    let id = req.user;
    if (id = null){
        res.status(404).send();
    }
    else{
        let user = await mongooseQuery.getUser(req.body);
        res.json(user);
    }
});

mainRouter.post('/profile/createCollection/:name', async (req, res) => {
    let newCollection = await mongooseQuery.createCollection(req.body);
    res.json(newCollection);
});

mainRouter.get('/collection/:id', async (req, res) => {
    let collection = await mongooseQuery.getCollection(req.body._id)
        .catch(err => {res.sendStatus(404)});
    res.json(collection);
})

mainRouter.post('/collection/updateCollection/:id', async (req, res) => {
    let updatedCollection = 
        await mongooseQuery.updateCollection(req.body._id, req.body.updated)
                            .catch(err => {res.sendStatus(404);});
    res.json(updatedCollection);
});

mainRouter.get('/session/:id', async (req, res) => {

});


app.use(passportCallbacks.isLoggedIn)

app.use('/', authRouter)
app.use('/main', mainRouter)

db.on('error', console.error.bind(console, "Error connecting to MongoDB Atlas Database:"))

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))