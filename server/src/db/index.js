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
  console.log('Updated User: ', user)
  return user;
}

exports.createCollection = async function(name, description, songList) {
  let collection = await new Collection({
    name,
    description,
    songList
  }).save().catch(error => console.log(error));;
  console.log('New collection: ', collection, collection.songList, collection.likes);
  return collection;
}

//exports.createCollection('the bigger crunch', 'crunchy like oreo');

exports.getCollection = async function(collectionObject){
  console.log('get collection');
  let collection = await connection.then(async () => {
    return await Collection.findOne(collectionObject);
  }).catch(error => console.log(error));
  
  return collection;
}
 

exports.updateCollection = async function(collectionObject, updateFieldsObject){
  console.log('update collection');
  let collection = await connection.then(async () => {
    return await Collection.findOneAndUpdate(collectionObject, updateFieldsObject, {new: true});
  }).catch(error => console.log(error));
  console.log('Updated Collection: ', collection);
}

//updateCollection({'_id': '5faaa7f7f098b317d81e5585'}, {name: 'the bigger crunch'});

exports.deleteCollection = async function(collectionObject){
  console.log('delete collection')
  let collection = await connection.then(async () => {
    return await Collection.findOneAndRemove(collectionObject);
  }).catch(error => console.log(error));
  
}

//deleteCollection({name: 'the bigger crunch'});

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

//createSession('hello', 'shipping tools', 12);

exports.getSession = async function(sessionObject){
  let session = await connection.then(async () => {
    return await Session.findOne(sessionObject);
  }).catch(error => {console.log(error)});

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
  console.log('Get collections from search query');
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

//async function 


async function createSong(_id, title, artist, album, embedLink, imageLink) {
  return new Song({
    _id,
    title,
    artist,
    album,
    embedLink,
    imageLink
  }).save();
}

async function findSong(songObject) { 
  return await Song.findOne(songObject)
}

exports.User = User
exports.Collection = Collection
exports.Session = Session
exports.db = db