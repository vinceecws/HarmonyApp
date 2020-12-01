const express = require("express")
const mongooseQuery = require('../db');
const stripUser = require('./index').stripUser

module.exports = function(mainSocket, sessionSocket) {

    apiRouter = express.Router()

    apiRouter.get('/topSessions', async (req, res) => {
        let sessions = await mongooseQuery.getSessions()
            .catch(err => {
                return res.status(401).json({
                    error: {
                        name: "Invalid session",
                        message: "Invalid query"
                    },
                    message: "Invalid query",
                    statusCode: 401,
                    data: {
                        sessions: null
                    },
                    success: false
                })
            });
        return res.status(200).json({
            message: "Fetch success",
            statusCode: 200,
            data: {
                sessions: {sessions}
            },
            success: true
        })
    })

    apiRouter.post('/addSongToFavorites/:songId', async (req, res) => {
        let songId = req.params.songId

        if (songId == null){
            return res.status(401).json({
                error: {
                    name: "Bad request",
                    message: "Invalid songId"
                },
                message: "Invalid songId",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }
        else if (!req.user) {
            return res.status(401).json({
                error: {
                    name: "Unauthorized",
                    message: "Unauthorized session"
                },
                message: "Unauthorized session",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }
        else {
            let updatedUser = await mongooseQuery.updateUser(req.user._id, {
                $push: {
                likedSongs: songId 
                }
            }).catch(err => res.sendStatus(404))

            return res.status(200).json({
                message: "Update successful",
                statusCode: 200,
                data: {
                    user: stripUser(updatedUser)
                },
                success: true
            })
            
        }

    });

    apiRouter.post('/removeSongFromFavorites/:songId', async (req, res) => {
        let songId = req.params.songId

        if (songId == null){
            return res.status(401).json({
                error: {
                    name: "Bad request",
                    message: "Invalid songId"
                },
                message: "Invalid songId",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }
        else if (!req.user) {
            return res.status(401).json({
                error: {
                    name: "Unauthorized",
                    message: "Unauthorized session"
                },
                message: "Unauthorized session",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }
        else {
            let updatedUser = await mongooseQuery.updateUser(req.user._id, {
                $pull: {
                likedSongs: songId 
                }
            }).catch(err => res.sendStatus(404))

            return res.status(200).json({
                message: "Update successful",
                statusCode: 200,
                data: {
                    user: stripUser(updatedUser)
                },
                success: true
            })
            
        }

    });

    apiRouter.post('/addCollectionToFavorites/:collectionId', async (req, res) => {
        let collectionId = req.params.collectionId

        if (collectionId == null){
            return res.status(401).json({
                error: {
                    name: "Bad request",
                    message: "Invalid collectionId"
                },
                message: "Invalid collectionId",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }
        else if (!req.user) {
            return res.status(401).json({
                error: {
                    name: "Unauthorized",
                    message: "Unauthorized session"
                },
                message: "Unauthorized session",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }
        else {
            let updatedUser = await mongooseQuery.updateUser(req.user._id, {
                $push: {
                likedCollections: collectionId 
                }
            }).catch(err => res.sendStatus(404))
            await mongooseQuery.updateCollection(collectionId, {
                $inc: { 
                    likes: 1 
                }
            }).catch(err => res.sendStatus(404))

            return res.status(200).json({
                message: "Update successful",
                statusCode: 200,
                data: {
                    user: stripUser(updatedUser)
                },
                success: true
            })
            
        }

    });

    apiRouter.post('/removeCollectionFromFavorites/:collectionId', async (req, res) => {
        let collectionId = req.params.collectionId

        if (collectionId == null){
            return res.status(401).json({
                error: {
                    name: "Bad request",
                    message: "Invalid collectionId"
                },
                message: "Invalid collectionId",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }
        else if (!req.user) {
            return res.status(401).json({
                error: {
                    name: "Unauthorized",
                    message: "Unauthorized session"
                },
                message: "Unauthorized session",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }
        else {
            let updatedUser = await mongooseQuery.updateUser(req.user._id, {
                $pull: {
                likedCollections: collectionId 
                }
            }).catch(err => res.sendStatus(404))
            await mongooseQuery.updateCollection(collectionId, {
                $inc: { 
                    likes: -1 
                }
            }).catch(err => res.sendStatus(404))

            return res.status(200).json({
                message: "Update successful",
                statusCode: 200,
                data: {
                    user: stripUser(updatedUser)
                },
                success: true
            })
            
        }

    });

    apiRouter.post('/createCollection/:collectionName', async (req, res) => {
        let collectionName = req.params.collectionName;
        
        if (collectionName == null) {
            return res.status(200).json({
                error: {
                    name: "Bad request",
                    message: "Invalid collection name"
                },
                message: "Invalid collection name",
                statusCode: 400,
                data: {
                    user: null,
                    collectionId: null
                },
                success: false
            })
        }
        else if (!req.user) {
            return res.status(401).json({
                error: {
                    name: "Unauthorized",
                    message: "Unauthorized session"
                },
                message: "Unauthorized session",
                statusCode: 401,
                data: {
                    user: null,
                    collectionId: null
                },
                success: false
            })
        }
        else {
            let newCollection = await mongooseQuery.createCollection(req.user._id, stripUser(req.user).username, collectionName)
            let updatedUser = await mongooseQuery.getUser({
                _id: req.user._id
            }).catch(err => res.sendStatus(404))

            return res.status(200).json({
                message: "Post success",
                statusCode: 200,
                data: {
                    user: stripUser(updatedUser),
                    collectionId: newCollection._id
                },
                success: true
            })
        }
        
    })

    apiRouter.post('/createCollectionWithSong/:collectionName&:songId', async (req, res) => {
        let collectionName = req.params.collectionName
        let songId = req.params.songId

        if (collectionName == null || songId == null){
            return res.status(401).json({
                error: {
                    name: "Bad request",
                    message: "Invalid name or song id"
                },
                message: "Invalid name or song id",
                statusCode: 401,
                data: {
                    user: null,
                    collectionId: null
                },
                success: false
            })
        }
        else if (!req.user) {
            return res.status(401).json({
                error: {
                    name: "Unauthorized",
                    message: "Unauthorized session"
                },
                message: "Unauthorized session",
                statusCode: 401,
                data: {
                    user: null,
                    collectionId: null
                },
                success: false
            })
        }
        else {
            let newCollection = await mongooseQuery.createCollection(req.user._id, collectionName, "", [songId])
            let updatedUser = await mongooseQuery.getUser({
                _id: req.user._id
            }).catch(err => res.sendStatus(404))

            return res.status(200).json({
                message: "Creation successful",
                statusCode: 200,
                data: {
                    user: stripUser(updatedUser),
                    collectionId: newCollection._id
                },
                success: true
            })
            
        }

    });

    apiRouter.post('/addSongToCollection/:songId&:collectionId', async (req, res) => {
        let songId = req.params.songId;
        let collectionId = req.params.collectionId
        
        if (songId == null || collectionId == null) {
            return res.status(200).json({
                error: {
                    name: "Bad request",
                    message: "Invalid song id or collection id"
                },
                message: "Invalid song id or collection id",
                statusCode: 400,
                data: {
                    user: null
                },
                success: false
            })
        }
        else if (!req.user) {
            return res.status(401).json({
                error: {
                    name: "Unauthorized",
                    message: "Unauthorized session"
                },
                message: "Unauthorized session",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }
        else {
            let collection = await mongooseQuery.updateCollection(collectionId, {
                $push: {
                songList: songId 
                }
            })
            let updatedUser = await mongooseQuery.getUser({
                _id: req.user._id
            }).catch(err => res.sendStatus(404))

            return res.status(200).json({
                message: "Update successful",
                statusCode: 200,
                data: {
                    user: stripUser(updatedUser)
                },
                success: true
            })
        }
    })

    apiRouter.post('/removeSongFromCollection/:songId&collectionId', async (req, res) => {
        let songId = req.params.songId;
        let collectionId = req.params.collectionId
        
        if (songId == null || collectionId == null) {
            return res.status(200).json({
                error: {
                    name: "Bad request",
                    message: "Invalid song id or collection id"
                },
                message: "Invalid song id or collection id",
                statusCode: 400,
                data: {
                    user: null
                },
                success: false
            })
        }
        else if (!req.user) {
            return res.status(401).json({
                error: {
                    name: "Unauthorized",
                    message: "Unauthorized session"
                },
                message: "Unauthorized session",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }
        else {
            let collection = await mongooseQuery.updateCollection(collectionId, {
                $pull: {
                songList: songId 
                }
            })
            let updatedUser = await mongooseQuery.getUser({
                _id: req.user._id
            }).catch(err => res.sendStatus(404))

            return res.status(200).json({
                message: "Update successful",
                statusCode: 200,
                data: {
                    user: stripUser(updatedUser)
                },
                success: true
            })
        }
        
    })

    apiRouter.get('/profile/:id', async (req, res) => {
        let id = req.params.id;
        if (id == null){
            return res.status(401).json({
                error: {
                    name: "Bad request",
                    message: "Invalid query"
                },
                message: "Invalid query",
                statusCode: 401,
                data: {
                    user: null
                },
                success: false
            })
        }
        else {
            let user = await mongooseQuery.getUser({'_id': req.params.id});
            
            return res.status(200).json({
                message: "Fetch success",
                statusCode: 200,
                data: {
                    user: stripUser(user)
                },
                success: true
            })
        }
    });

    apiRouter.get('/profile/:id/sessions', async (req, res) => {
        let id = req.params.id;
        if (id == null){
            return res.status(401).json({
                error: {
                    name: "Bad request",
                    message: "Invalid query"
                },
                message: "Invalid query",
                statusCode: 401,
                data: {
                    sessions: null
                },
                success: false
            })
        }
        else {
            let user = await mongooseQuery.getUser({'_id': id})
            let sessions = await mongooseQuery.getSession(user.sessions, true)
            
            return res.status(200).json({
                message: "Fetch success",
                statusCode: 200,
                data: {
                    sessions: sessions.map(session => {
                        session.type = "session"
                        return session
                    })
                },
                success: true
            })
        }
    });

    apiRouter.get('/profile/:id/playlists', async (req, res) => {
        let id = req.params.id;
        if (id == null){
            return res.status(401).json({
                error: {
                    name: "Bad request",
                    message: "Invalid query"
                },
                message: "Invalid query",
                statusCode: 401,
                data: {
                    playlists: null
                },
                success: false
            })
        }
        else {
            let user = await mongooseQuery.getUser({'_id': id})
            let playlists = await mongooseQuery.getCollection(user.playlists, true)
            
            return res.status(200).json({
                message: "Fetch success",
                statusCode: 200,
                data: {
                    playlists: playlists.map(playlist => {
                        playlist.type = "collection"
                        return playlist
                    })
                },
                success: true
            })
        }
    });

    apiRouter.get('/profile/:id/likedCollections', async (req, res) => {
        let id = req.params.id;
        if (id == null){
            return res.status(401).json({
                error: {
                    name: "Bad request",
                    message: "Invalid query"
                },
                message: "Invalid query",
                statusCode: 401,
                data: {
                    playlists: null
                },
                success: false
            })
        }
        else {
            let user = await mongooseQuery.getUser({'_id': id})
            let likedCollections = await mongooseQuery.getCollection(user.likedCollections, true)
            
            return res.status(200).json({
                message: "Fetch success",
                statusCode: 200,
                data: {
                    likedCollections: likedCollections.map(collection => {
                        collection.type = "collection"
                        return collection
                    })
                },
                success: true
            })
        }
    });

    apiRouter.get('/settings', async (req, res) => {
        if(req.user == null){
            return res.status(404).json({
                error: {
                    name: "Invalid session",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    collection: null
                },
                success: false
            })
        }
        let id = req.user._id;
        if (id == null){
            return res.status(404).json({
                error: {
                    name: "User not found",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    sessions: null
                },
                success: false
            })
        }
        else{
            let user = await mongooseQuery.getUser({'_id': id});
            return res.status(200).json({
                message: "Fetch success",
                statusCode: 200,
                data: {
                    user: stripUser(user)
                },
                success: true
            })
        }
    });

    apiRouter.get('/collection/:id', async (req, res) => {
        let id = req.params.id;
        if (id == null){
            return res.status(404).json({
                error: {
                    name: "Invalid session",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    collection: null
                },
                success: false
            })
        }
        else{
            let collection = await mongooseQuery.getCollection({'_id': req.params.id});
            return res.status(200).json({
                message: "Fetch success",
                statusCode: 200,
                data: {
                    collection: collection
                },
                success: true
            })
        }
    });

    apiRouter.get('/home', async (req, res) => {
        //Suggestions only
    });

    apiRouter.get('/collection/delete/:id', async (req, res) => {
        let id = req.params.id;
        if(id == null){
            return res.status(404).json({
                error: {
                    name: "Invalid session",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    collection: null
                },
                success: false
            })
        }
        else{
            await mongooseQuery.deleteCollection({'_id': req.params.id});
            return res.status(200).json({
                message: "Collection deleted",
                statusCode: 200,
                success:true
            })
        }
        
    });

    apiRouter.post('/collection/updateCollection/:id', async (req, res) => {
        let id = req.params.id;
        if(id == null){
            return res.status(404).json({
                error: {
                    name: "Invalid session",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    collection: null
                },
                success: false
            })
        }
        else{
            let updateCollection = await mongooseQuery.updateCollection(req.params.id, req.body);
            return res.status(200).json({
                message: "Collection updated",
                statusCode: 200,
                data: {
                    collection: updateCollection
                },
                success:true
            })
        }
    });

    apiRouter.post('/settings/changeUsername', async (req, res) => {
        if(req.user == null){
            return res.status(404).json({
                error: {
                    name: "Invalid session",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    collection: null
                },
                success: false
            })
        }
        let id = req.user._id
        if(id == null){
            return res.status(404).json({
                error: {
                    name: "Invalid session",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    collection: null
                },
                success: false
            })
        }
        else{
            let user = await mongooseQuery.changeUsername({'_id': id}, req.body);

            if (user == 409) {
                return res.status(200).json({
                    error: {
                        name: "Username Taken",
                        message: "Username Taken"
                    },
                    statusCode: 409,
                    data: {
                        user: null
                    },
                    success: false
                })
            }
            else if (user == 422){
                return res.status(200).json({
                    error: {
                        name: "Incorrect Password",
                        message: "Incorrect Password"
                    },
                    statusCode: 422,
                    data: {
                        user: null
                    },
                    success: false
                })
            }
            return res.status(200).json({
                message: "Username Changed",
                data: {
                    user: stripUser(user)
                },
                statusCode: 200,
                success:true
            })
        }
        
    });
    apiRouter.post('/settings/changeBiography', async (req, res) => {
        if(req.user == null){
            return res.status(404).json({
                error: {
                    name: "Invalid session",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    collection: null
                },
                success: false
            })
        }
        let id = req.user._id
        if(id == null){
            return res.status(404).json({
                error: {
                    name: "Invalid session",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    collection: null
                },
                success: false
            })
        }
        else{
            let user = await mongooseQuery.changeBiography({'_id': id}, req.body);
            if (!user) {
                return res.status(200).json({
                    message: "biography could not be updated",
                    statusCode: 422,
                    data: {
                        user: null
                    },
                    success: false
                })
            }
            return res.status(200).json({
                message: "Biography changed",
                data: {
                    user: stripUser(user)
                },
                statusCode: 200,
                success:true
            })

        }
        
    });
    apiRouter.post('/settings/changePassword', async (req, res) => {
        if(req.user == null){
            return res.status(404).json({
                error: {
                    name: "Invalid session",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    collection: null
                },
                success: false
            })
        }
        let id = req.user._id
        if(id == null){
            return res.status(404).json({
                error: {
                    name: "Invalid session",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    collection: null
                },
                success: false
            })
        }
        else{
            let user = await mongooseQuery.changePassword({'_id': id}, req.body);
            if (!user) {
                return res.status(200).json({
                    message: "password could not be updated",
                    statusCode: 422,
                    data: {
                        user: null
                    },
                    success: false
                })
            }
            return res.status(200).json({
                message: "Biography changed",
                data: {
                    user: stripUser(user)
                },
                statusCode: 200,
                success:true
            })
        }
        
    });

    apiRouter.post('/collection/updateUser/:id', async (req, res) => {
        let userId = req.params.id;
        if(userId == null){
            return res.status(404).json({
                error: {
                    name: "Invalid session",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    collection: null
                },
                success: false
            })
        }
        else {
            let updatedUser = await mongooseQuery.updateUser(userId, req.body)
                                            .catch(err => console.log(err));
            return res.status(200).json({
                message: 'User Updated',
                statusCode: 200,
                data: {user: stripUser(updatedUser)},
                success: true
            })
        }
    });

    apiRouter.post('/session/newSession', async (req, res) => {
        if (!req.user) {
            return res.status(401).json({
                error: {
                    name: "Invalid session",
                    message: "Unauthorized"
                },
                message: "Unauthorized",
                statusCode: 401,
                data: {
                    session: null
                },
                success: false
            })
        }
        else {
            let user = stripUser(req.user)
            let newSession = await mongooseQuery.createSession(user._id, user.username, req.body.name, Date.now(), req.body.initialQueue)

            let sessions = await mongooseQuery.getSessions().catch(err => {
                mainSocket.emit('error')
            })
            mainSocket.emit('top-sessions', sessions, (response) => {
                if (response.status === 200) {
                    console.log("Sessions acknowledged")
                }
            })

            return res.status(200).json({
                message: "Session created",
                statusCode: 200,
                data: {
                    session: newSession
                },
                success:true
            })
        }
    });

    apiRouter.get('/session/:id', async (req, res) => {
        let id = req.params.id;
        if (id == null){
            return res.status(404).json({
                error: {
                    name: "Invalid session",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    session: null
                },
                success: false
            })
        }
        else{
            let session = await mongooseQuery.getSession({'_id': req.params.id});

            return res.status(200).json({
                message: "Fetch success",
                statusCode: 200,
                data: {
                    session: session
                },
                success: true
            })
            
        }

    });


    apiRouter.post('/session/endSession/:id', async (req, res) => {
        let id = req.params.id;
        if (id == null){
            return res.status(404).json({
                error: {
                    name: "Invalid session",
                    message: "Not found"
                },
                message: "Not found",
                statusCode: 404,
                data: {
                    session: null
                },
                success: false
            })
        }
        else if (!req.user) {
            return res.status(401).json({
                error: {
                    name: "Invalid session",
                    message: "Unauthorized"
                },
                message: "Unauthorized",
                statusCode: 401,
                data: {
                    session: null
                },
                success: false
            })
        }
        else {
            let session = await mongooseQuery.getSession(req.params.id).catch(err => {
                res.sendStatus(404)
            })

            if (session.hostId !== req.user._id) {
                return res.status(401).json({
                    error: {
                        name: "Invalid credentials",
                        message: "Unauthorized"
                    },
                    message: "Unauthorized",
                    statusCode: 401,
                    data: {
                        session: null
                    },
                    success: false
                })
            }
            else {
                /* Need to emit end-session event to all participants */

                await mongooseQuery.updateSession(req.params.id, {
                    endTime: Date.now(),
                    live: false,
                    playerState: {},
                    queueState: {}
                }).catch(err => {
                    res.sendStatus(404)
                })

                let sessions = await mongooseQuery.getSessions().catch(err => {
                    mainSocket.emit('error')
                })
                mainSocket.emit('top-sessions', sessions, (response) => {
                    if (response.status === 200) {
                        console.log("Sessions acknowledged")
                    }
                })

                return res.status(200).json({
                    message: "Fetch successful",
                    statusCode: 200,
                    success: true
                })
            }
        }

    });

    apiRouter.get('/search', async (req, res) => {
        if (req.user) {
            let user = await mongooseQuery.getUser({
                _id: req.user._id
            }).catch(err => res.sendStatus(404));

            let playlists = await mongooseQuery.getCollection(user.playlists)

            return res.status(200).json({
                message: "Fetch successful",
                statusCode: 200,
                data: {
                    playlists: playlists
                },
                success: true
            })
        }
        else {
            return res.status(200).json({
                message: "Unauthenticated",
                statusCode: 200,
                data: null,
                success: false
            })
        }
    })

    apiRouter.get('/search/query=:search', async (req, res) => {
        let sessionMatches = await mongooseQuery.getSessionsFromQuery(req.params.search, true)
                                        .catch(err => res.sendStatus(404));
                                        
        let collectionMatches = await mongooseQuery.getCollectionsFromQuery(req.params.search, true)
                                        .catch(err => res.sendStatus(404));	
                                        
        let userMatches = await mongooseQuery.getUsersFromQuery(req.params.search, true)
                                        .catch(err => res.sendStatus(404));

        if (!req.user){
            return res.status(200).json({
                message: "Query successful",
                statusCode: 200,
                data: {
                    sessions: sessionMatches.map(session => {
                        session.type = "session"
                        return session
                    }), 
                    collections: collectionMatches.map(collection => {
                        collection.type = "collection"
                        return collection
                    }),
                    users: userMatches.map(user => {
                        var strippedUser = stripUser(user)
                        strippedUser.type = "user"
                        return strippedUser
                    })
                },
                success: true
            })
        }
        else {
            let thisUser = await mongooseQuery.getUser({'_id': req.user._id})
                                .catch(err => {console.log('User not found')});
            let filteredSessions = [];
            let filteredCollections = [];
            let filteredUsers = [];

            for (let s of sessionMatches){
                if (thisUser.google.name === undefined && s.hostName !== thisUser.local.username){
                    filteredSessions.push(s);
                }
                else if (s.hostName !== thisUser.google.name){
                        filteredSessions.push(s);
                }
            }
            for (let c of collectionMatches){
                for (let p of thisUser.playlists){
                    if (c._id !== p){
                        filteredCollections.push(c);
                    }
                }
            }
            for (let u of userMatches){
                if (thisUser._id !== u._id){
                    let fetchedUser = stripUser(u)
                    filteredUsers.push(fetchedUser);
                } 
            }

            return res.status(200).json({
                message: "Query successful",
                statusCode: 200,
                data: {
                    sessions: filteredSessions.map(session => {
                        session.type = "session"
                        return session
                    }), 
                    collections: filteredCollections.map(collection => {
                        collection.type = "collection"
                        return collection
                    }),
                    users: filteredUsers.map(user => {
                        user.type = "user"
                        return user
                    })
                },
                success: true
            })
        }				
    });

    return apiRouter
}