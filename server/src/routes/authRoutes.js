const express = require("express")

module.exports = function(passport) {
    
    authRouter = express.Router()

    authRouter.get('/login', function(req, res, next) {
        if (req.user) {
            return res.status(200).json({
                message: "Authorization success",
                statusCode: 200,
                data: {
                    user: req.user
                },
                success: true
            })
        }
        else {
            return res.status(401).json({
                error: {
                    name: "JsonWebTokenError",
                    message: "Unauthorized"
                },
                message: "Unauthorized",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }
    })

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
    return authRouter
}