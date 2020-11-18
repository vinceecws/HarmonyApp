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

const MongoStore = require('connect-mongo')(session)
/*
    Express.js configurations
*/
app.use(cors({credentials: true, origin: true}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//app.use(cookieParser(process.env.MONGO_STORE_SESSION_SECRET.split(' ')))
app.use(session({
    store: new MongoStore({ 
        mongooseConnection: db
    }),
    secret: process.env.MONGO_STORE_SESSION_SECRET.split(' '),
    resave: true, 
    saveUninitialized: true 
}))
passport.serializeUser(passportCallbacks.serialize)
passport.deserializeUser(passportCallbacks.deserialize)

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

app.use(passportCallbacks.isLoggedIn)

/*
    Express.js routes
*/

const authRouter = require('./routes/authRoutes.js')(passport)
const mainRouter = require('./routes/mainRoutes.js')

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