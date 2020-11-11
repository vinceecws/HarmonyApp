const User = require('../db').User
const express = require("express")
const mongooseQuery = require('../db');

mainRouter = express.Router()

mainRouter.route('/home').get(function(req, res) {
	User.find(function(err, users){
		if (err){
			console.log(err);
		} else {
			
			res.send("Obtained Users");
		}
	});
});

mainRouter.get('/profile/:id', async (req, res) => {
    let id = req.params.id;
    if (id = null){
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
})

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
        await mongooseQuery.createSession(req.body.hostId, 
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



module.exports = mainRouter