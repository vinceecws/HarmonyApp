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
            return res.status(401).json({
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

            return res.status(200).json({
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
            return res.status(401).json({
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

            return res.status(200).json({
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

app.use(passportCallbacks.isLoggedIn)

app.use('/', authRouter)
app.use('/main', mainRouter)

db.on('error', console.error.bind(console, "Error connecting to MongoDB Atlas Database:"))

process.on('SIGTERM', terminateServer)
process.on('SIGINT', terminateServer)

var server = app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))

function terminateServer() {
    db.close()
    server.close()
}