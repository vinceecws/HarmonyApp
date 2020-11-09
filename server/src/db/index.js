const connectionString = "mongodb+srv://vincey:vincey123@harmonycluster.itr8g.mongodb.net/HarmonyApp?retryWrites=true&w=majority";
const mongoose = require('mongoose')

const userSchema = require('./Schema/userSchema.js')
const collectionSchema = require('./Schema/collectionSchema.js')
const songSchema = require('./Schema/songSchema.js')

const User = mongoose.model('user', userSchema, 'user')
const Collection = mongoose.model('collection', collectionSchema, 'collection')
const Song = mongoose.model('song', songSchema, 'song')

const connection = mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection

async function createUser(name, password, email, dob) { //User CRUD methods: Create
  return new User({
    name,
    password,
    email,
    dob
  }).save()
}

async function findUser(userObject) { //User CRUD methods: Retrieve
  return await User.findOne(userObject)
}

async function createCollection(name, description, songList) {
  return new Collection({
    name,
    description,
    songList
  }).save()
}

async function findCollection(collectionObject) {
  return await Collection.findOne(collectionObject)
}

async function createSong(_id, title, artist, album, embedLink, imageLink) {
  return new Song({
    _id,
    title,
    artist,
    album,
    embedLink,
    imageLink
  }).save()
}

async function findSong(songObject) { 
  return await Song.findOne(songObject)
}

async function testCreateCollection() {
  const name = process.argv[2]
  const description = process.argv[3]

  let collection = await connection
  .then(async () => {
    return findCollection({name: name})
  })
  .catch(error => {console.log(error)});

  if (!collection) {
    collection = await createCollection(name, description)
  }

  collection = await findCollection({name: name})
  song = await findSong({title: "Holding On To You"})
  collection.songList.push(song.id)
  song = await findSong({title: "Saturday Nights"})
  collection.songList.push(song.id)
  await collection.save()

  collection = await findCollection({name: name})
  console.log(collection)

  mongoose.connection.close()
  process.exit(0)
} 

async function testCreateSong() {
  const _id = process.argv[2]
  const title = process.argv[3]
  const artist = process.argv[4]
  const album = process.argv[5]
  const embedLink = process.argv[6]

  let song = await connection
  .then(async () => {
    return findSong({title: title})
  })
  .catch(error => {console.log(error)});

  if (!song) {
    song = await createSong(_id, title, artist, album, embedLink)
  }
  
  console.log(song)

  mongoose.connection.close()
  process.exit(0)
} 

module.exports = db