const express = require("express")
const mongooseQuery = require('../db');

mainRouter = express.Router()

mainRouter.get('/', async (req, res) => {
    let sessions = await mongooseQuery.getSessions()
        .catch(err => {
            return res.status(401).json({
                error: {
                    name: "JsonWebTokenError",
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

mainRouter.get('/profile/:id', async (req, res) => {
    let id = req.params.id;
    if (id == null){
        return res.status(404).json({
            error: {
                name: "JsonWebTokenError",
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
		let user = await mongooseQuery.getUser({'_id': req.params.id});
		let fetchedUser = {username: user.google.name === undefined ? user.local.username : user.google.name,
								Id: user._id, biography: user.biography,
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

mainRouter.post('/profile/createCollection/:name', async (req, res) => {
    let newCollection = await mongooseQuery.createCollection({name: req.params.name});
    return res.json(newCollection);
});


mainRouter.get('/collection/:id', async (req, res) => {
    let collection = await mongooseQuery.getCollection({'_id': req.params.id})
        .catch(err => {res.sendStatus(404)});
    return res.json(collection);
});

mainRouter.get('/home', async (req, res) => {
    //Suggestions only
});

mainRouter.post('/collection/delete/:id', async (req, res) => {
    await mongooseQuery.deleteCollection({'_id': req.params.id})
                        .catch(err => {res.sendStatus(404)});
    res.send('Collection deleted');
})

mainRouter.post('/collection/updateCollection/:id', async (req, res) => {
    let updatedCollection = 
        await mongooseQuery.updateCollection(req.params.id, req.body)
                            .catch(err => {res.sendStatus(404);});
    //res.json(updatedCollection);
    res.send('Collection Updated');
});

mainRouter.post('/session/newSession', async (req, res) => {
    let newSession = 
        await mongooseQuery.createSession(req.body.hostId, req.body.hostName,
            req.body.name, req.body.startTime, req.body.endTime, 0, 0, 
            req.body.live, req.body.initialQueue, req.actionLog)
            .catch(err => {res.sendStatus(404);});
    return res.json(newSession);
})

mainRouter.get('/session/:id', async (req, res) => {
    let id = req.params.id;
    if (id == null){
        return res.status(404).json({
            error: {
                name: "JsonWebTokenError",
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
        let session = await mongooseQuery.getSession({'_id': req.params.id});

        var newInitialQueue = JSON.parse(JSON.stringify(session.initialQueue))
        var newActionLog = JSON.parse(JSON.stringify(session.actionLog))
        session.initialQueue = {newInitialQueue}
        session.newActionLog = {newActionLog}

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
    let session = await mongooseQuery.updateSession(req.params.id)
                                    .catch(err => {res.sendStatus(404)});
    return res.send('Session Saved');
});

mainRouter.post('/search/createCollection/:name', async (req, res) => {
	let newCollection = await mongooseQuery.createCollection({name: req.params.name})
									.catch(err => res.sendStatus(404));
    return res.json(newCollection);
});

mainRouter.get('/search/query=:search', async (req, res) => {
	let sessionMatches = await mongooseQuery.getSessionsFromQuery(req.params.search)
									.catch(err => res.sendStatus(404));
	let collectionMatches = await mongooseQuery.getCollectionsFromQuery(req.params.search)
									.catch(err => res.sendStatus(404));	
	let userMatches = await mongooseQuery.getUsersFromQuery(req.params.search)
									.catch(err => res.sendStatus(404));	
	if (req.user == null){
		return res.json({session: sessionMatches, 
					collections: collectionMatches,
					users: userMathces});
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
					Id: u._id, biography: u.biography,
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