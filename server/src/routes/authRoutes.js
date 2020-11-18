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
                    name: "Invalid session",
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

    authRouter.post('/login', passport.authenticate('local-login'), function(req, res, next) {
            if (!req.user) {
                return res.status(401).json({
                    error: {
                        name: "Invalid session",
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

            req.login(req.user, function(err) {
                if (err) {
                    return next(err)
                }

                return res.status(200).json({
                    message: "Authorization success",
                    statusCode: 200,
                    data: {
                        user: req.user
                    },
                    success: true
                })
            })
        })

    authRouter.post('/login/signup', function(req, res, next) {
        passport.authenticate('local-signup', function(err, user, info) {
            if (err) {
                return next(err)
            }

            if (!user) {
                return res.status(200).json({
                    message: "Username is taken",
                    statusCode: 200,
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
        req.logout()
        req.session.destroy(function(err) {
            if (err) {
                return res.status(400).json({
                    error: {
                        name: "Invalid session",
                        message: "Invalid logout action"
                    },
                    message: "Invalid logout action",
                    statusCode: 400,
                    data: {},
                    success: false
                })
            }
            else {
                return res.status(200).json({
                    message: "Logout success",
                    statusCode: 200,
                    data: {},
                    success: true
                })
            }
        })
    });
    return authRouter
}