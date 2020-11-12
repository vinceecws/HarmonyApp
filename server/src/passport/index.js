const userSchema = require('../db/Schema/userSchema.js')
const mongoose = require('mongoose')
const User = mongoose.model('user', userSchema, 'user')

exports.serialize = function(req, user, done) {
    done(null, user._id)
}

exports.deserialize = function(req, id, done) {
    User.findById(id, '-password', function(err, user) {
        done(err, user)
    })
}

exports.localLogIn = function(req, username, password, done) {
    User.findOne({
        'local.username': username
    }, function(err, user) {

        if (err) {
            return done(err)
        } 

        if (!user) {
            return done(null, false, {
                message: "Invalid username"
            })
        }

        if (!user.authenticateLocal(username, password)) {
            return done(null, false, {
                message: "Invalid password"
            })
        }

        return done(null, user)
     })
}

exports.localSignUp = function(req, username, password, done) {
    User.findOne({
        'local.username': username
    }, function(err, user) {

        if (err) {
            return done(err)
        } 

        if (user) {
            return done(null, false, {
                message: "Username is taken"
            })
        }

        var user = new User({
            local: {
                username: username,
                password: password
            }
        })
        user.save(function(err) {
            if (err) {
                return done(err)
            }
            return done(null, user)
        })
        
     })
}

/*
    Middleware to check if user is authenticated
    Use to restrict access against certain features
    e.g. Viewing account settings, home screen suggestions, search screen history

    Middleware functions called after can check if a request is authenticated
    using res.locals.authenticated
*/
exports.isLoggedIn = function(req, res, next) {

    if (req.isAuthenticated()) {
        res.locals.authenticated = false
    }
    else {
        res.locals.authenticated = true
    }
    next()
}