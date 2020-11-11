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
const MongoStore = require('connect-mongo')(session)
/*
    Express.js configurations
*/
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
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
app.use(passport.initialize())
app.use(passport.session())

/*
    Passport.js configurations
*/
passport.use('local-login', new LocalStrategy({
    passReqToCallback : true
}, passportCallbacks.localLogIn))

passport.use('local-signup', new LocalStrategy({
    passReqToCallback : true
}, passportCallbacks.localSignUp))

passport.serializeUser(passportCallbacks.serialize)
passport.deserializeUser(passportCallbacks.deserialize)

/*
    Express.js routes
*/

authRouter = express.Router()

authRouter.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
        if (err) {
            return next(err)
        }

        if (!user) {
            return res.send({
                error: {
                    name: "JsonWebTokenError",
                    message: "Invalid credentials"
                },
                message: "Invalid credentials",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }

        req.login(user, function(err) {
            if (err) {
                return next(err)
            }

            return res.send({
                message: "Authorization success",
                statusCode: 200,
                data: {
                    user: user
                },
                success: true
            })
        })
    })(req, res, next)
})

authRouter.post('/login/signup', function(req, res, next) {
    passport.authenticate('local-signup', function(err, user, info) {
        if (err) {
            return next(err)
        }

        if (!user) {
            return res.send({
                error: {
                    name: "JsonWebTokenError",
                    message: "Username is taken"
                },
                message: "Username is taken",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }

        req.login(user, function(err) {
            if (err) {
                return next(err)
            }

            return res.send({
                message: "Sign-up success",
                statusCode: 200,
                data: {
                    user: user
                },
                success: true
            })
        })
    })(req, res, next)
})

authRouter.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login')
});


mainRouter.get('/profile/:id', async (req, res) => {
    let id = req.params.id;
    if (id = null){
        res.status(404).send();
    }
    else{
        let user = await mongooseQuery.getUser({'_id': req.params.id});
        res.json(user);
    }
});

mainRouter.post('/profile/createCollection/:name', async (req, res) => {
    let newCollection = await mongooseQuery.createCollection({name: req.params.name});
    res.json(newCollection);
});


mainRouter.get('/collection/:id', async (req, res) => {
    let collection = await mongooseQuery.getCollection({'_id': req.params.id})
        .catch(err => {res.sendStatus(404)});
    res.json(collection);
})

mainRouter.post('/collection/delete/:id', async (req, res) => {
    await mongooseQuery.deleteCollection({'_id': req.params.id})
                        .catch(err => {res.sendStatus(404)});
    res.send('Collection deleted');
})

mainRouter.post('/collection/updateCollection/:id', async (req, res) => {
    let updatedCollection = 
        await mongooseQuery.updateCollection(req.params.id, req.body)
                            .catch(err => {res.sendStatus(404);});
    //res.json(updatedCollection);
    res.send('Collection Updated');
});

mainRouter.post('/session/newSession', async (req, res) => {
    let newSession = 
        await mongooseQuery.createSession(req.body.hostId, 
            req.body.name, req.body.startTime, req.body.endTime, 0, 0, 
            req.body.live, req.body.initialQueue, req.actionLog)
            .catch(err => {res.sendStatus(404);});
    res.json(newSession);
})

mainRouter.get('/session/:id', async (req, res) => {
    let session = await mongooseQuery.getSession({'_id': req.params.id})
                                    .catch(err => {res.sendStatus(404);});
    res.json(session);
});


mainRouter.post('/session/endSession/:id', async (req, res) => {
    let session = await mongooseQuery.updateSession(req.params.id)
                                    .catch(err => {res.sendStatus(404)});
    res.send('Session Saved');
});





app.use(passportCallbacks.isLoggedIn)

app.use('/', authRouter)
app.use('/main', mainRouter)

db.on('error', console.error.bind(console, "Error connecting to MongoDB Atlas Database:"))

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))