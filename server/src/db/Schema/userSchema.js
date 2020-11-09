const mongoose = require('mongoose')
const collectionSchema = require('./collectionSchema')

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: false
  },
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  biography: {
      type: String,
      default: ""
  },
  privateMode: {
      type: Boolean,
      default: false
  },
  live: {
    type: Boolean,
    default: false
  },
  playlists: { 
    type: [mongoose.Schema.Types.ObjectId],
    ref: "collectionId"
  },
  sessions: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "sessionId"
  },
  history: {
    type: Array
  },
  likedSongs: {
    type: [String],
    ref: "YouTube VideoId"
  },
  likedCollections: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "collectionId"
  }
})

module.exports = userSchema