const connectionString = "mongodb+srv://vincey:vincey123@harmonycluster.itr8g.mongodb.net/HarmonyApp?retryWrites=true&w=majority";
const mongoose = require('mongoose')

const userSchema = require('./Schema/userSchema.js')
const collectionSchema = require('./Schema/collectionSchema.js')
const songSchema = require('./Schema/songSchema.js')
const sessionSchema = require('./Schema/sessionSchema.js')

const User = mongoose.model('user', userSchema, 'user')
const Collection = mongoose.model('collection', collectionSchema, 'collection')
const Session = mongoose.model('session', sessionSchema, 'session')
const connection = mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
const db = mongoose.connection


exports.createUserLocal = async function(name, password) { //User CRUD methods: Create
  let newUser = await new User({
    local: {name, password}
  }).save().catch(error => console.log(error));
  console.log('New user: ', newUser, newUser.google.id === undefined);
  return newUser;
}

//exports.createUserLocal('tim', 'ow');

exports.createUserGoogle = async function(id, token, email, name){
  let newUser = await new User({
    google: {id, token, email, name}
  }).save().catch(error => console.log(error));
  console.log('New user: ', newUser);
  
  return newUser;
}

exports.getUser = async function(userObject) { //User CRUD methods: Retrieve
  let user = await connection.then(async () => {
    return await User.findOne(userObject)
  }).catch(error => {console.log(error)});
  return user;
}


exports.updateUser = async function(userId, updatePayload) {
  let user = await connection.then(async () => {
    return await User.findOneAndUpdate({'_id': userId}, updatePayload, {new: true});
  }).catch(error => console.log(error));
  return user;
}

exports.createCollection = async function(userId, name, description, songList) {
  let collection = await new Collection({
    name: name,
    ownerId: userId,
    description: description ? description : "",
    songList: songList ? songList : []
  }).save().catch(error => console.log(error));

  let res = await User.update({
    _id: userId
  }, {
    $push: {
      playlists: collection._id 
    }
  })
  return collection
}
 
exports.getCollection = async function(collectionObject) {
  
  var collection
  if (Array.isArray(collectionObject)) {
    collection = await connection.then(async () => {
      return await Collection.find({
        '_id': { $in: collectionObject
        }
      }).catch(error => {
        console.log(error)
      })
    })
  }
  else {
    collection = await connection.then(async () => {
      return await Collection.findOne(collectionObject);
    }).catch(error => {console.log(error)});
  }

  return collection;
}

exports.updateCollection = async function(collectionId, updateFieldsObject){
  let collection = await connection.then(async () => {
    return await Collection.findOneAndUpdate({_id: collectionId}, updateFieldsObject, {new: true});
  }).catch(error => console.log(error));

  return collection
}
//Settings
exports.changeUsername = async function(userObject, updateFieldsObject){
  console.log('update username for user');

  /*let user = await connection.then(async () => {
    return await User.findOneAndUpdate(userObject, {$set:{'local.username':updateFieldsObject.username}}, {new: true});
  }).catch(error => console.log(error));*/
  let user = await connection.then(async () => {
    return await User.findOne({'local.username':updateFieldsObject.username});
  }).catch(error => console.log(error));
  if(user){
    return 409;
  }
  user = await connection.then(async () => {
    return await User.findOne(userObject);
  }).catch(error => console.log(error));
  console.log(user);
  if (!user.authenticateLocal(user.local.username, updateFieldsObject.password)) {
      console.log("incorrect password");
      return 422;
      
  }
  user.local.username = updateFieldsObject.username;
  user = await User.updateOne(userObject, {$set:{'local.username':updateFieldsObject.username}}, {new: true});
  user = await connection.then(async () => {
    return await User.findOne(userObject);
  }).catch(error => console.log(error));
  return user;
  
}
exports.changeBiography= async function(userObject, updateFieldsObject){
  console.log('update biography for user');
  
  /*let user = await connection.then(async () => {
    return await User.findOneAndUpdate(userObject, {$set:{'local.username':updateFieldsObject.username}}, {new: true});
  }).catch(error => console.log(error));*/
  
  let user = await connection.then(async () => {
    return await User.findOneAndUpdate(userObject, {$set:{'biography':updateFieldsObject.biography}}, {new: true});
  }).catch(error => console.log(error));
  
  return user;
  
}
exports.changePassword= async function(userObject, updateFieldsObject){
  console.log('update password for user');
  /*let user = await connection.then(async () => {
    return await User.findOneAndUpdate(userObject, {$set:{'local.username':updateFieldsObject.username}}, {new: true});
  }).catch(error => console.log(error));*/
  
  user = await connection.then(async () => {
    return await User.findOne(userObject);
  }).catch(error => console.log(error));
  if (!user.authenticateLocal(user.local.username, updateFieldsObject.password)) {
      console.log("incorrect password");
      return false;
      
  }
  user.local.password = updateFieldsObject.new_password;
  user.save();
  
  return user;
  
}
//updateCollection({'_id': '5faaa7f7f098b317d81e5585'}, {name: 'the bigger crunch'});

exports.deleteCollection = async function(collectionObject){
  console.log('delete collection')
  let collection = await connection.then(async () => {
    return await Collection.findOneAndRemove(collectionObject);
  }).catch(error => console.log(error));
  
}

exports.createSession = async function(hostId, hostName, name, startTime, endTime, streams, likes, live, initialQueue, actionLog){
  let session = await new Session({
    hostid, 
    hostName,
    name, 
    startTime, 
    endTime, 
    streams, 
    likes, 
    live,
    initialQueue, 
    actionLog
  }).save().catch(error => {console.log(error)});
  
  console.log('connection closed');
  return session;
}

exports.getSession = async function(sessionObject) {
  var session
  if (Array.isArray(sessionObject)) {
    session = await connection.then(async () => {
      return await Session.find({
        '_id': { $in: sessionObject
        }
      }).catch(error => {
        console.log(error)
      })
    })
  }
  else {
    session = await connection.then(async () => {
      return await Session.findOne(sessionObject);
    }).catch(error => {console.log(error)});
  }

  return session;
}

exports.getSessions = async function(){
  let sessions = await connection.then(async () => {
    return await Session.find({});
  }).catch(error => {console.log(error)});
  return sessions;
}


exports.updateSession = async function(sessionID, updateObject){
  console.log('Update session');
  let session = await connection.then(async () => {
    return await Session.findOneAndUpdate({'_id': sessionID}, updateObject, {new: true});
  });
  
  return session;
}

exports.deleteSession = async function(sessionObject){
  console.log('Delete session');
  let session = await connection.then(async () => {
    return await Session.findOneAndRemove(sessionObject);
  }).catch(error => {console.log(error)});

}


exports.getCollectionsFromQuery = async function(query){
  let collections = await connection.then(async () => {
    return await Collection.find({name: query}).sort({likes: 1});
  }).catch(err => console.log(err));
  return collections;
}

exports.getUsersFromQuery = async function(query){
  let users = await connection.then(async () => {
    return await User.find({'local.username': query});
  }).catch(err => console.log(err));
  return users;
}

exports.getSessionsFromQuery = async function(query){
  let sessions = await connection.then(async () => {
    return await Session.find({name: query});
  }).catch(error => {console.log(error)});
  return sessions;
}

exports.User = User
exports.Collection = Collection
exports.Session = Session
exports.db = db