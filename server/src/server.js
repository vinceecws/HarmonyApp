const passport = require("passport")
const mongoose = require('mongoose')
const GoogleStrategy = require("passport-google-oauth20").Strategy
const LocalStrategy = require('passport-local').Strategy

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require("express")
const app = express()
const db = require('./db')
const userSchema = require('./db/Schema/userSchema.js')
const apiPort = 4000

const User = mongoose.model('user', userSchema, 'user')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json())

db.on('error', console.error.bind(console, "Error connecting to MongoDB Atlas Database:"))

passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({
        username: username
    }, function(err, user) {
        // This is how you handle error
        if (err) return done(err);
        // When user is not found
        if (!user) return done(null, false);
        // When password is not correct
        if (!user.authenticate(password)) return done(null, false);
        // When all things are good, we return the user
        return done(null, user);
     });
}));

const HarmonyRoutes = express.Router();

app.use('/main', HarmonyRoutes);

HarmonyRoutes.route('/home').get(function(req, res) {
	User.find(function(err, users){
		if (err){
			console.log(err);
		} else {
			
			res.send("Obtained Users");
		}
	});
});


app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))