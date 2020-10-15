const mongoose = require('mongoose')
const collectionSchema = require('./collectionSchema')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Username is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  email: {
      type: String,
      required: [true, 'Email is required']
  },
  dob: {
      type: Date,
      required: [true, 'Date of birth is required']
  },
  biography: {
      type: String,
      default: ""
  },
  privateMode: {
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
  }
})

module.exports = userSchema