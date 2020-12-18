const express = require("express")
const mongooseQuery = require('../db');
const stripUser = require('./index').stripUser
const paginate = require('./index').paginate
const _ = require('lodash');
const path = require('path')
const fs = require('fs')


module.exports = function(mainSocket, sessionSocket) {

    apiRouter = express.Router()

    apiRouter.post('/collection/uploadImage/:collectionId', async (req, res) => {
        
        if (req.params.collectionId == null){
            
            return res.status(401).json({
                error: {
                    name: "Bad request",
                    message: "Invalid collectionId"
                },
                message: "Invalid collectionId",
                statusCode: 401,
                data: {
                    collection: null
                },
                success: false
            })
        }
        else {
            let imageBuffer = Buffer.from(req.body.image).toString();
            let contentType = req.body.contentType;
            let updatedCollection = await mongooseQuery.updateCollection(req.params.collectionId, 
                {'image.data': imageBuffer, 'image.contentType': contentType});
            return res.status(200).json({
                message: 'Update Successful',
                statusCode: 200,
                success: true
            })
        }
    })

    apiRouter.post('/settings/uploadImage', async (req, res) => {
        
        if (req.user == null){
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
        else {
            let imageBuffer = Buffer.from(req.body.image).toString();
            let contentType = req.body.contentType;
            
            let updatedUser = await mongooseQuery.updateUser(req.user._id, 
                {'image.data': imageBuffer, 'image.contentType': contentType}, true);
            return res.status(200).json({
                message: 'Update Successful',
                data: {
                    user: stripUser(updatedUser)
                },
                statusCode: 200,
                success: true
            })
        }
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
            let user = stripUser(req.user)
            let newCollection = await mongooseQuery.createCollection(user._id, user.username, collectionName)
            /*
            let updatedUser = await mongooseQuery.getUser({
                _id: req.user._id
            }).catch(err => res.sendStatus(404)) */
            let updatedPlaylists = [];
            for (let p of user.playlists){
                updatedPlaylists.push(p);
            }
            updatedPlaylists.push(newCollection._id);
            let updatedUser = await mongooseQuery.updateUser(user._id, updatedPlaylists);
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
            let user = stripUser(req.user)
            let newCollection = await mongooseQuery.createCollection(user._id, user.username, collectionName, "", [songId])
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
            let user = await mongooseQuery.getUser({'_id': req.params.id}, true);
            if(user === null){
                return res.status(404).json({
                    error: {
                        name: "Invalid User",
                        message: "Not found"
                    },
                    message: "User not found",
                    statusCode: 404,
                    data: {
                        user: null
                    },
                    success: false
                })
            }
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

    apiRouter.get('/profile/:id/playlists/pageToken=:pageToken', async (req, res) => {
        let id = req.params.id
        let pageToken = req.params.pageToken
        if (id == null || pageToken <= 0) {
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
            let pagination = paginate(user.playlists, pageToken, 8)
            let playlists = await mongooseQuery.getCollection(pagination.list, true)
            return res.status(200).json({
                message: "Fetch success",
                statusCode: 200,
                data: {
                    items: playlists.map(playlist => {
                        playlist.type = "collection"
                        return playlist
                    }),
                    nextPageToken: pagination.nextPageToken,
                    prevPageToken: pagination.prevPageToken
                },
                success: true
            })
        }
    });

    apiRouter.get('/profile/:id/likedCollections/pageToken=:pageToken', async (req, res) => {
        let id = req.params.id
        let pageToken = req.params.pageToken
        if (id == null || pageToken <= 0) {
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
            let pagination = paginate(user.likedCollections, pageToken, 8)
            let likedCollections = await mongooseQuery.getCollection(pagination.list, true)
            return res.status(200).json({
                message: "Fetch success",
                statusCode: 200,
                data: {
                    items: likedCollections.map(collection => {
                        collection.type = "collection"
                        return collection
                    }),
                    nextPageToken: pagination.nextPageToken,
                    prevPageToken: pagination.prevPageToken
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
            let collection = await mongooseQuery.getCollection({'_id': req.params.id}, true).catch(err => res.sendStatus(404));
            if(collection === null){
                return res.status(404).json({
                    error: {
                        name: "Invalid Collection",
                        message: "Not found"
                    },
                    message: "Collection not found",
                    statusCode: 404,
                    data: {
                        collection: null
                    },
                    success: false
                })
            }
            else{
                return res.status(200).json({
                    message: "Fetch success",
                    statusCode: 200,
                    data: {
                        collection: collection
                    },
                    success: true
                }) 
            }
        }
    });

    apiRouter.get('/home', async (req, res) => {
        var suggestions = []
        var elements = []
        if (req.user) { //Listen again, Recommended for you
            let userHistory = _.cloneDeep(req.user.history)
            let obj

            for (var i = 0; i < userHistory.length; i++) {
                if (userHistory[i].type === "user") {
                    continue
                }
                else if (userHistory[i].type === "collection") {
                    obj = await mongooseQuery.getCollection({
                        _id: userHistory[i]._id
                    }, true)

                    if (obj) {
                        obj.type = "collection"
                        elements.push(obj)
                    }
                }
                else if (userHistory[i].type === "song") {
                    elements.push(userHistory[i])
                }
            }

            if (elements.length >= 4) { //Include only if there's enough to show
                suggestions.push({
                    categoryName: "Listen Again",
                    suggestions: elements.slice(0, 10)
                })
            }
        }

        elements = await mongooseQuery.getTopCollections(max=10, lean=true)

        elements = elements.map(collection => {
            collection.type = "collection"
            return collection
        })

        if (elements.length >= 4) { //Include only if there's enough to show
            suggestions.push({
                categoryName: "Recommended For You",
                suggestions: elements
            })
        }

        return res.status(200).json({
            message: "Generated suggestions",
            statusCode: 200,
            data: {
                suggestions: suggestions
            },
            success: true
        })
    })

    apiRouter.get('/collection/delete/:id', async (req, res) => {
        if (req.params.id == null) {
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
            let newPlaylists = [];
            let newlikedCollections = [];

            for (let p of req.user.playlists){
                if (String(p) !== req.params.id){
                    newPlaylists.push(p);
                }
            }
            for (let p of req.user.likedCollections){
                if (String(p) !== req.params.id){
                    newlikedCollections.push(p);
                }
            }

            let updatedUser = await mongooseQuery.updateUser(req.user._id, {playlists: newPlaylists, likedCollections: newlikedCollections});
            return res.status(200).json({
                message: "Collection deleted",
                statusCode: 200,
                data: {
                    user: stripUser(updatedUser)
                },
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
    apiRouter.post('/settings/changePrivateMode', async (req, res) => {
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
            let user = await mongooseQuery.changePrivateMode({'_id': id}, req.body);
            if (!user) {
                return res.status(200).json({
                    message: "private mode could not be updated",
                    statusCode: 422,
                    data: {
                        user: null
                    },
                    success: false
                })
            }
            return res.status(200).json({
                message: "Private mode changed",
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
                    sessionId: null
                },
                success: false
            })
        }
        else {
            var user = stripUser(req.user)
            var session = await mongooseQuery.createSession(user._id, user.username, req.body.name, Date.now()).catch(err => res.sendStatus(404))
            if (user.image && user.image.data){
                session = await mongooseQuery.updateSession(session._id, {image: user.image});
            }
            var updatedUser = await mongooseQuery.updateUser(user._id, {
                currentSession: session._id,
                live: !user.privateMode,
                hosting: true
            }).catch(err => res.sendStatus(404))

            return res.status(200).json({
                message: "Session created",
                statusCode: 200,
                data: {
                    user: stripUser(updatedUser),
                    sessionId: session._id,
                },
                success: true
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
            var session = await mongooseQuery.getSession({'_id': req.params.id}, true);
            if (session !== null) {
                
                if (req.user){
                    var user = stripUser(req.user)
                    var updatedUser = await mongooseQuery.updateUser(user._id, {
                            currentSession: session._id
                        }).catch(err => res.sendStatus(404))

                    return res.status(200).json({
                        message: "Fetch success",
                        statusCode: 200,
                        data: {
                            session: session,
                            user: stripUser(updatedUser)
                        },
                        success: true
                    })
                }
                else {
                    return res.status(200).json({
                        message: "Fetch success",
                        statusCode: 200,
                        data: {
                            session: session,
                        },
                        success: true
                    })
                }
            }
            else {
                return res.status(404).json({
                    message: "Failed to find session",
                        statusCode: 404,
                        data: {
                            session: null,
                        },
                        success: false
                })
            }
            
        }
    });


    apiRouter.post('/session/endSession/', async (req, res) => {
        if (req.user) {
            var session = await mongooseQuery.getSession({'_id': req.user.currentSession}, true)

            if (String(session.hostId) === String(req.user._id)) {
                await mongooseQuery.deleteSession({
                    _id: session._id
                }).catch(err => {
                    res.sendStatus(404)
                })

                var updatedUser = await mongooseQuery.updateUser(req.user._id, {
                    hosting: false,
                    live: false,
                    currentSession: null
                }).catch(err => res.sendStatus(404))

                return res.status(200).json({
                    message: "End success",
                    statusCode: 200,
                    data: {
                        user: stripUser(updatedUser)
                    },
                    success: true
                })
            }
            else {
                return res.status(401).json({
                    error: {
                        name: "Invalid credentials",
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
        }
        else {
            return res.status(401).json({
                error: {
                    name: "Invalid credentials",
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
    });

    apiRouter.post('/session/leaveSession', async (req, res) => {
        if (req.user && req.user.currentSession) {
            var user = stripUser(req.user)
            var updatedUser = await mongooseQuery.updateUser(user._id, {
                currentSession: null
            }).catch(err => res.sendStatus(404))

            return res.status(200).json({
                message: "Leave success",
                statusCode: 200,
                data: {
                    user: stripUser(updatedUser)
                },
                success: true
            })
        }
        else {
            return res.status(400).json({
                message: "Invalid request",
                statusCode: 400,
                data: {
                    user: null
                },
                success: true
            })
        }
    })

    apiRouter.get('/search', async (req, res) => {
        if (req.user) {
            let playlists = await mongooseQuery.getCollection(req.user.playlists)

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

    apiRouter.get('/search/history', async (req, res) => {
        /*
            Recursively fetch Collections and Users
        */
        if (req.user) {
            let userHistory = _.cloneDeep(req.user.history)
            let history = []
            let obj

            for (var i = 0; i < userHistory.length; i++) {
                if (userHistory[i].type === "user") {
                    obj = await mongooseQuery.getUser({
                        _id: userHistory[i]._id
                    }, true)
                    if (obj) {
                        obj = stripUser(obj)
                        obj.type = "user"
                        history.push(obj)
                    }
                }
                else if (userHistory[i].type === "collection") {
                    obj = await mongooseQuery.getCollection({
                        _id: userHistory[i]._id
                    }, true)
                    if (obj) {
                        obj.type = "collection"
                        history.push(obj)
                    }
                }
                else if (userHistory[i].type === "song") {
                    history.push(userHistory[i])
                }
            }
            return res.status(200).json({
                message: "Fetch successful",
                statusCode: 200,
                data: {
                    history: history
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

    apiRouter.post('/search/history/prepend', async (req, res) => {
        /*
            Check if (type, id) combination exists
                If it does, then just move it up to the top
                Otherwise, prepend at the top
        */

       if (req.user) {
        let userHistory = _.cloneDeep(req.user.history)
        let ind = userHistory.findIndex(obj => obj.type === req.body.type && obj._id === req.body._id)

        let historyObj
        if (ind >= 0) {
            historyObj = userHistory.splice(ind, 1)[0]
        }
        else {
            historyObj = {
                type: req.body.type,
                _id: req.body._id
            }
        }
        userHistory.unshift(historyObj)

        let updatedUser = await mongooseQuery.updateUser({
            _id: req.user._id
        }, {
            history: userHistory
        }, true)

        return res.status(200).json({
            message: "Prepend successful",
            statusCode: 200,
            data: {
                user: stripUser(updatedUser)
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

    apiRouter.post('/search/history/remove/:ind', async (req, res) => {
        if (!req.params.ind) {
            return res.status(400).json({
                message: "Bad request",
                statusCode: 400,
                data: null,
                success: false
            })
        }

        if (req.user) {
            let userHistory = _.cloneDeep(req.user.history)
            userHistory.splice(req.params.ind, 1)
            let updatedUser = await mongooseQuery.updateUser({
                _id: req.user._id
            }, {
                history: userHistory
            })

            return res.status(200).json({
                message: "Removal successful",
                statusCode: 200,
                data: {
                    user: stripUser(updatedUser)
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

    apiRouter.get('/search/query=:query', async (req, res) => {
        let sessionMatches = await mongooseQuery.getSessionsFromQuery(req.params.query, true)
                                        .catch(err => res.sendStatus(404));
        let collectionMatches = await mongooseQuery.getCollectionsFromQuery(req.params.query)
                                        .catch(err => res.sendStatus(404));	 
        let userMatches = await mongooseQuery.getUsersFromQuery(req.params.query)
                                        .catch(err => res.sendStatus(404));
        return res.status(200).json({
            message: "Query successful",
            statusCode: 200,
            data: {
                session: {
                    items: sessionMatches.result.map(obj => {
                        var session = obj.toObject()
                        session.type = "session"
                        return session
                    }),
                    nextPageToken: sessionMatches.nextPageToken,
                    prevPageToken: sessionMatches.prevPageToken
                }, 
                collection: {
                    items: collectionMatches.result.map(obj => {
                        var collection = obj.toObject()
                        collection.type = "collection"
                        return collection
                    }),
                    nextPageToken: collectionMatches.nextPageToken,
                    prevPageToken: collectionMatches.prevPageToken
                },
                user: {
                    items: userMatches.result.map(obj => {
                        var strippedUser = stripUser(obj.toObject())
                        strippedUser.type = "user"
                        return strippedUser
                    }),
                    nextPageToken: userMatches.nextPageToken,
                    prevPageToken: userMatches.prevPageToken
                }
            },
            success: true
        })
    });

    apiRouter.get('/search/pageQuery=:query&category=:category&:pageToken=:pageToken', async (req, res) => {
        let matches
        let pageToken = parseInt(req.params.pageToken)
        let query = req.params.query
        let category = req.params.category

        switch (category) {
            case "session":
                matches = await mongooseQuery.getSessionsFromQuery(query, true, pageToken)
                    .catch(err => res.sendStatus(404));
                break
            case "collection":
                matches = await mongooseQuery.getCollectionsFromQuery(query, pageToken)
                    .catch(err => res.sendStatus(404));	
                break
            case "user":
                matches = await mongooseQuery.getUsersFromQuery(query, pageToken)
                    .catch(err => res.sendStatus(404));
                break
            default:
                return res.status(400).json({
                    message: "Invalid category",
                    statusCode: 400,
                    data: null,
                    success: false
                })
        }

        return res.status(200).json({
            message: "Query successful",
            statusCode: 200,
            data: {
                items: matches.result.map(obj => {
                    var item = obj.toObject()
                    item.type = category
                    return item
                }),
                nextPageToken: matches.nextPageToken,
                prevPageToken: matches.prevPageToken
            },
            success: true
        })	
    });

    return apiRouter
}