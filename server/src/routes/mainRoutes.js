const express = require("express")
const mongooseQuery = require('../db');
const stripUser = require('./index').stripUser

mainRouter = express.Router()

mainRouter.get('/', async (req, res) => {
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

mainRouter.post('/api/addSongToFavorites/:songId', async (req, res) => {
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

mainRouter.post('/api/removeSongFromFavorites/:songId', async (req, res) => {
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

mainRouter.post('/api/createCollection/:collectionName', async (req, res) => {
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
        let newCollection = await mongooseQuery.createCollection(req.user._id, collectionName)
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

mainRouter.post('/api/createCollectionWithSong/:collectionName&:songId', async (req, res) => {
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

mainRouter.post('/api/addSongToCollection/:songId&collectionId', async (req, res) => {
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

mainRouter.post('/api/removeSongFromCollection/:songId&collectionId', async (req, res) => {
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

mainRouter.get('/profile/:id', async (req, res) => {
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
		let fetchedUser = {username: user.google.name === undefined ? user.local.username : user.google.name,
								_id: user._id, biography: user.biography,
								privateMode: user.privateMode, live: user.live,
								playlists: user.playlists, sessions: user.sessions,
								history: user.history, likedSongs: user.likedSongs,
								likedCollections: user.likedCollections}
        return res.status(200).json({
            message: "Fetch success",
            statusCode: 200,
            data: {
                user: fetchedUser
            },
            success: true
        })
    }
});

mainRouter.get('/profile/:id/sessions', async (req, res) => {
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
        let sessions = await mongooseQuery.getSession(user.sessions)
        
        return res.status(200).json({
            message: "Fetch success",
            statusCode: 200,
            data: {
                sessions: sessions
            },
            success: true
        })
    }
});

mainRouter.get('/profile/:id/playlists', async (req, res) => {
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
        let playlists = await mongooseQuery.getCollection(user.playlists)
        
        return res.status(200).json({
            message: "Fetch success",
            statusCode: 200,
            data: {
                playlists: playlists
            },
            success: true
        })
    }
});

mainRouter.get('/profile/:id/likedCollections', async (req, res) => {
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
        let likedCollections = await mongooseQuery.getCollection(user.likedCollections)
        
        return res.status(200).json({
            message: "Fetch success",
            statusCode: 200,
            data: {
                likedCollections: likedCollections
            },
            success: true
        })
    }
});

mainRouter.get('/settings', async (req, res) => {
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
                name: "Invalid session",
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
        let fetchedUser = {username: user.google.name === undefined ? user.local.username : user.google.name,
                                _id: user._id, biography: user.biography,
                                privateMode: user.privateMode, live: user.live,
                                playlists: user.playlists, sessions: user.sessions,
                                history: user.history, likedSongs: user.likedSongs,
                                likedCollections: user.likedCollections}
        return res.status(200).json({
            message: "Fetch success",
            statusCode: 200,
            data: {
                user: fetchedUser
            },
            success: true
        })
    }
});

mainRouter.get('/collection/:id', async (req, res) => {
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

mainRouter.get('/home', async (req, res) => {
    //Suggestions only
});

mainRouter.get('/collection/delete/:id', async (req, res) => {
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

mainRouter.post('/collection/updateCollection/:id', async (req, res) => {
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

mainRouter.post('/settings/changeUsername', async (req, res) => {
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
        let updatedUser = await mongooseQuery.changeUsername({'_id': id}, req.body);
        if (!updatedUser) {
            return res.status(422).json({
                message: "Invalid password or username taken",
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
                user: updatedUser
            },
            statusCode: 200,
            success:true
        })
    }
    
});
mainRouter.post('/settings/changeBiography', async (req, res) => {
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
        let updatedUser = await mongooseQuery.changeBiography({'_id': id}, req.body);
        if (!updatedUser) {
            return res.status(422).json({
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
                user: updatedUser
            },
            statusCode: 200,
            success:true
        })
    }
    
});
mainRouter.post('/settings/changePassword', async (req, res) => {
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
        let updatedUser = await mongooseQuery.changePassword({'_id': id}, req.body);
        if (!updatedUser) {
            return res.status(422).json({
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
                user: updatedUser
            },
            statusCode: 200,
            success:true
        })
    }
    
});

mainRouter.post('/collection/updateUser/:id', async (req, res) => {
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
            data: {user: updatedUser},
            success: true
        })
    }
});

mainRouter.post('/session/newSession', async (req, res) => {
    let newSession = 
        await mongooseQuery.createSession(req.body.hostId, req.body.hostName,
            req.body.name, req.body.startTime, req.body.endTime, 0, 0, 
            req.body.live, req.body.initialQueue, req.actionLog)
    return res.status(200).json({
			message: "Collection updated",
			statusCode: 200,
			data: {
				session: newSession
			},
			success:true
		})
});

mainRouter.get('/session/:id', async (req, res) => {
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


mainRouter.post('/session/endSession/:id', async (req, res) => {
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
        let session = await mongooseQuery.updateSession(req.params.id);
        return res.status(200).json({
            message: "Fetch successful",
            statusCode: 200,
            success: true
        })
        
    }

});

mainRouter.get('/search', async (req, res) => {
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

mainRouter.get('/search/query=:search', async (req, res) => {
	let sessionMatches = await mongooseQuery.getSessionsFromQuery(req.params.search)
									.catch(err => res.sendStatus(404));
	let collectionMatches = await mongooseQuery.getCollectionsFromQuery(req.params.search)
									.catch(err => res.sendStatus(404));	
	let userMatches = await mongooseQuery.getUsersFromQuery(req.params.search)
                                    .catch(err => res.sendStatus(404));	
	if (req.user == null){
		return res.json({sessions: sessionMatches, 
					collections: collectionMatches,
					users: userMatches});
	}
	else {
		let thisUser = await mongooseQuery.getUser({'_id': req.user})
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
		for (let p of thisUser.playlists){
			for (let c of collectionMatches){
				if (c._id !== p._id){
					filteredCollections.push(c);
				}
			}
		}
		for (let u of userMatches){
			if (thisUser._id !== u._id){
				let fetchedUser = {username: u.google.name === undefined ? u.local.username : u.google.name,
					_id: u._id, biography: u.biography,
					privateMode: u.privateMode, live: u.live,
					playlists: u.playlists, sessions: u.sessions,
					history: u.history, likedSongs: u.likedSongs,
					likedCollections: u.likedCollections}
				filteredUsers.push(fetchedUser);
			} 
		}
		return res.json({sessions: filteredSessions, collections: filteredCollections,
					users: filteredUsers});
	}				
});



module.exports = mainRouter;