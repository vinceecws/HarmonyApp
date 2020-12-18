const connectionString = "mongodb+srv://vincey:vincey123@harmonycluster.itr8g.mongodb.net/HarmonyApp?retryWrites=true&w=majority";
const mongoose = require('mongoose')

const userSchema = require('./Schema/userSchema.js')
const collectionSchema = require('./Schema/collectionSchema.js')
const sessionSchema = require('./Schema/sessionSchema.js')

const User = mongoose.model('user', userSchema, 'user')
const Collection = mongoose.model('collection', collectionSchema, 'collection')
const Session = mongoose.model('session', sessionSchema, 'session')
const connection = mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
const db = mongoose.connection


exports.createUserLocal = async function(name, password) { //User CRUD methods: Create
    let newUser = await new User({
        local: {name, password}
    }).save().catch(error => {return error});
    console.log('New user: ', newUser, newUser.google.id === undefined);
    return newUser;
}

//exports.createUserLocal('tim', 'ow');

exports.createUserGoogle = async function(id, token, email, name){
    let newUser = await new User({
        google: {id, token, email, name}
    }).save().catch(error => {return error});
    console.log('New user: ', newUser);
    
    return newUser;
}

exports.getUser = async function(userObject, lean=false) { //User CRUD methods: Retrieve
    let user = await connection.then(async () => {
        if (lean) {
            return await User.findOne(userObject).lean()
        }
        else {
            return await User.findOne(userObject)
        }
    }).catch(error => {return error});
    return user;
}


exports.updateUser = async function(userId, updatePayload, lean=false) {
    let user = await connection.then(async () => {
        if (lean) {
            return await User.findOneAndUpdate({'_id': userId}, updatePayload, {new: true}).lean()
        }
        else {
            return await User.findOneAndUpdate({'_id': userId}, updatePayload, {new: true})
        }
    }).catch(error => {return error});
    return user;
}

exports.createCollection = async function(userId, userName, name, description, songList) {
    let collection = await new Collection({
        name: name,
        ownerId: userId,
        ownerName: userName,
        description: description ? description : "",
        songList: songList ? songList : []
    }).save().catch(error => {return error});

    let res = await User.update({
        _id: userId
    }, {
        $push: {
            playlists: collection._id 
        }
    })
    return collection
}
 
exports.getCollection = async function(collectionObject, lean=false) {
    
    var collection
    if (Array.isArray(collectionObject)) {
        collection = await connection.then(async () => {
            if (lean) {
                return await Collection.find({
                    '_id': { $in: collectionObject
                    }
                }).lean()
            }
            else {
                return await Collection.find({
                    '_id': { $in: collectionObject
                    }
                })
            }
        }).catch(error => {
            return error
        })
    }
    else {
        collection = await connection.then(async () => {
            if (lean) {
                return await Collection.findOne(collectionObject).lean()
            }
            else {
                return await Collection.findOne(collectionObject)
            }
        }).catch(error => {return error});
    }
    
    return collection;
}

exports.getTopCollections = async function(max=15, lean=false) {

    var collection = await connection.then(async () => {
        if (lean) {
            return await Collection.find({}).sort({
                likes: -1
            }).limit(max).lean()
        }
        else {
            return await Collection.find({}).sort({
                likes: -1
            }).limit(max)
        }
    }).catch(error => {return error})

    return collection
}

exports.updateCollection = async function(collectionId, updateFieldsObject, lean=false){
    let collection = await connection.then(async () => {
        if (lean) {
            return await Collection.findOneAndUpdate({_id: collectionId}, updateFieldsObject, {new: true}).lean()
        }
        else {
            return await Collection.findOneAndUpdate({_id: collectionId}, updateFieldsObject, {new: true})
        }
    }).catch(error => {return error});

    return collection
}
//Settings
exports.changeUsername = async function(userObject, updateFieldsObject){
    console.log('update username for user');

    /*let user = await connection.then(async () => {
        return await User.findOneAndUpdate(userObject, {$set:{'local.username':updateFieldsObject.username}}, {new: true});
    }).catch(error => {return error});*/
    let user = await connection.then(async () => {
        return await User.findOne({'local.username':updateFieldsObject.username});
    }).catch(error => {return error});
    if(user){
        return 409;
    }
    user = await connection.then(async () => {
        return await User.findOne(userObject);
    }).catch(error => {return error});
    console.log(user);
    if (!user.authenticateLocal(user.local.username, updateFieldsObject.password)) {
            console.log("incorrect password");
            return 422;
            
    }
    user.local.username = updateFieldsObject.username;
    user = await User.updateOne(userObject, {$set:{'local.username':updateFieldsObject.username}}, {new: true});
    user = await connection.then(async () => {
        return await User.findOne(userObject);
    }).catch(error => {return error});
    return user;
    
}
exports.changeBiography = async function(userObject, updateFieldsObject){
    console.log('update biography for user');
    
    /*let user = await connection.then(async () => {
        return await User.findOneAndUpdate(userObject, {$set:{'local.username':updateFieldsObject.username}}, {new: true});
    }).catch(error => {return error});*/
    
    let user = await connection.then(async () => {
        return await User.findOneAndUpdate(userObject, {$set:{'biography':updateFieldsObject.biography}}, {new: true});
    }).catch(error => {return error});
    
    return user;
    
}
exports.changePrivateMode = async function(userObject, updateFieldsObject){
    console.log('update private mode for user');
    
    /*let user = await connection.then(async () => {
        return await User.findOneAndUpdate(userObject, {$set:{'local.username':updateFieldsObject.username}}, {new: true});
    }).catch(error => {return error});*/
    
    let user = await connection.then(async () => {
        return await User.findOneAndUpdate(userObject, {$set:{'privateMode':updateFieldsObject.privateMode}}, {new: true});
    }).catch(error => {return error});
    
    return user;
    
}
exports.changePassword = async function(userObject, updateFieldsObject){
    console.log('update password for user');
    /*let user = await connection.then(async () => {
        return await User.findOneAndUpdate(userObject, {$set:{'local.username':updateFieldsObject.username}}, {new: true});
    }).catch(error => {return error});*/
    
    user = await connection.then(async () => {
        return await User.findOne(userObject);
    }).catch(error => {return error});
    if (!user.authenticateLocal(user.local.username, updateFieldsObject.password)) {
            console.log("incorrect password");
            return false;
            
    }
    user.local.password = updateFieldsObject.new_password;
    user.save();
    
    return user;
    
}

exports.deleteCollection = async function(collectionObject, lean=false){
    let collection = await connection.then(async () => {
        if (lean) {
            return await Collection.findOneAndRemove(collectionObject).lean()
        }
        else {
            return await Collection.findOneAndRemove(collectionObject)
        }
    }).catch(error => {return error});
    
}

exports.createSession = async function(hostId, hostName, name, startTime){
    let session = await new Session({
        hostId: hostId,
        hostName: hostName,
        name: name,
        startTime: startTime,
        streams: 0,
        likes: 0,
        live: false
    }).save().catch(error => {return error});
    
    return session;
}

exports.getSession = async function(sessionObject, lean=false) {
    var session
    if (Array.isArray(sessionObject)) {
        session = await connection.then(async () => {
            if (lean) {
                return await Session.find({
                    '_id': { $in: sessionObject
                    }
                }).lean()
            }
            else {
                return await Session.find({
                    '_id': { $in: sessionObject
                    }
                })
            }
        }).catch(error => {
            return error
        })
    }
    else {
        session = await connection.then(async () => {
            if (lean) {
                return await Session.findOne(sessionObject).lean()
            }
            else {
                return await Session.findOne(sessionObject)
            }
        }).catch(error => {return error});
    }

    return session;
}

exports.getLiveSessions = async () => {
    let sessions = await connection.then(async () => {
        return await Session.find({
            live: true
        })
    }).catch(error => {return error});
    return sessions;
}


exports.updateSession = async function(sessionID, updateObject, lean=false){

    let session = await connection.then(async () => {
        if (lean) {
            return await Session.findOneAndUpdate({'_id': sessionID}, updateObject, {new: true}).lean().catch(error => {
                return error
            })
        }
        else {
            return await Session.findOneAndUpdate({'_id': sessionID}, updateObject, {new: true}).catch(error => {
                return error
            })
        }
    });
    
    return session;
}

exports.deleteSession = async function(sessionObject){
    await connection.then(async () => {
        return await Session.findOneAndRemove(sessionObject)
    }).catch(error => {return error});
}


exports.getCollectionsFromQuery = async function(query, page=1, limit=10){
    let paginateParams = {
        limit: limit,
        page: page
    }

    let collections = await connection.then(async () => {
        
        return await Collection.find({'name': {'$regex': query, '$options': 'i'}}).paginate(paginateParams)

    }).catch(err => console.log(err));
    return collections;
}

exports.getUsersFromQuery = async function(query, page=1, limit=10){
    let paginateParams = {
        limit: limit,
        page: page
    }

    let users = await connection.then(async () => {

        return await User.find({'local.username': {'$regex': query, '$options': 'i'}}).paginate(paginateParams)

    }).catch(err => console.log(err));
    return users;
}

exports.getSessionsFromQuery = async function(query, live=false, page=1, limit=10){
    let paginateParams = {
        limit: limit,
        page: page
    }

    let sessions = await connection.then(async () => {
        if (live) {
            return await Session.find({'$and': [
                {'$or':[
                    {name: {'$regex': query, '$options': 'i'}},
                    {hostName: {'$regex': query, '$options': 'i'}}]
                },
                {live: true}
            ]}).paginate(paginateParams)
        }
        else {
            return await Session.find({'$or': [
                {name: {'$regex': query, '$options': 'i'}},
                {hostName: {'$regex': query, '$options': 'i'}}
            ]}).paginate(paginateParams)
        }
    }).catch(error => {return error});
    return sessions;
}

exports.User = User
exports.Collection = Collection
exports.Session = Session
exports.db = db