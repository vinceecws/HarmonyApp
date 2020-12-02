const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  local: {
    username: String,
    password: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String
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
    ref: "Collection"
  },
  sessions: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Session"
  },
  history: {
    type: Array
  },
  likedSongs: {
    type: [String]
  },
  likedCollections: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Collection"
  },
  currentSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session"
  }
})

userSchema.methods.authenticateLocal = function(username, password) {
  return this.local.username === username && bcrypt.compareSync(password, this.local.password)
}

userSchema.methods.hashPassword = function(password) {
  return bcrypt.hashSync(password, 4)
}

userSchema.pre('save', function(next) {
  if (this.local.password) {
    this.local.password = bcrypt.hashSync(this.local.password, 4)
  }
  next()
})

module.exports = userSchema