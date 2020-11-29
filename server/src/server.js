require('dotenv').config(({path: './src/.env'}))

const passportCallbacks = require('./passport')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require("express")
const app = express()
const server = require("http").createServer(app)
const io = require('socket.io')(server)
const session = require("express-session")
const path = require('path')
const db = require('./db').db
const apiPort = process.env.PORT || 3000

const MongoStore = require('connect-mongo')(session)
const mongoSession = session({
    store: new MongoStore({ 
        mongooseConnection: db
    }),
    cookie: {
        domain: null
    },
    secret: process.env.MONGO_STORE_SESSION_SECRET.split(' '),
    resave: false, 
    saveUninitialized: false 
})
/*
    Express.js configurations
*/

//app.use(cors({credentials: true, origin: 'http://localhost:3000'}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(passport.session())
app.use(mongoSession)

passport.serializeUser(passportCallbacks.serialize)
passport.deserializeUser(passportCallbacks.deserialize)

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
const apiRouter = require('./routes/apiRoutes.js')

app.use('/auth', authRouter)
app.use('/api', apiRouter)

/*
    Serve static build of React app in production
*/
app.use(express.static(path.resolve(__dirname, '..', '..', 'client', 'build')))

// app.get('/', (req, res, next) => {
//     res.sendFile(path.resolve(__dirname, '..', '..', 'client', 'build', 'index.html'));
// });

const mainSocket = require('./socket/main.js')(io, mongoSession, passport.initialize(), passport.session())

db.on('error', console.error.bind(console, "Error connecting to MongoDB Atlas Database:"))

process.on('SIGTERM', terminateServer)
process.on('SIGINT', terminateServer)

server.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))

function terminateServer() {
    db.close()
    server.close()
}