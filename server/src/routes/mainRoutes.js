const express = require("express")
const mongooseQuery = require('../db');

mainRouter = express.Router()

mainRouter.get('/', async (req, res) => {
    let sessions = await mongooseQuery.getSessions()
        .catch(err => {res.sendStatus(404)});
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
        res.status(404).send();
    }
    else{
        let user = await mongooseQuery.getUser({'_id': req.params.id});
        res.json(user);
    }
});

mainRouter.post('/profile/createCollection/:name', async (req, res) => {
    let newCollection = await mongooseQuery.createCollection({name: req.params.name});
    res.json(newCollection);
});


mainRouter.get('/collection/:id', async (req, res) => {
    let collection = await mongooseQuery.getCollection({'_id': req.params.id})
        .catch(err => {res.sendStatus(404)});
    res.json(collection);
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
    res.json(newSession);
})

mainRouter.get('/session/:id', async (req, res) => {
    let session = await mongooseQuery.getSession({'_id': req.params.id})
                                    .catch(err => {res.sendStatus(404);});
    res.json(session);
});


mainRouter.post('/session/endSession/:id', async (req, res) => {
    let session = await mongooseQuery.updateSession(req.params.id)
                                    .catch(err => {res.sendStatus(404)});
    res.send('Session Saved');
});

mainRouter.post('/search/createCollection/:name', async (req, res) => {
	let newCollection = await mongooseQuery.createCollection({name: req.params.name})
									.catch(err => res.sendStatus(404));
    res.json(newCollection);
});

mainRouter.get('/search/query=:search', async (req, res) => {
	let sessionMatches = await mongooseQuery.getSessionsFromQuery(req.params.search)
									.catch(err => res.sendStatus(404));
	let collectionMatches = await mongooseQuery.getCollectionsFromQuery(req.params.search)
									.catch(err => res.sendStatus(404));	
	let userMatches = await mongooseQuery.getUsersFromQuery(req.params.search)
									.catch(err => res.sendStatus(404));	
	if (req.user == null){
		res.json({session: sessionMatches, 
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
			if (s.hostName !== thisUser.local.username){
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
			if (u.local.username !== thisUser.local.username){
				filteredUsers.push(u);
			} 
		}
		res.json({sessions: filteredSessions, collections: filteredCollections,
					users: filteredUsers});
	}				
});



module.exports = mainRouter;