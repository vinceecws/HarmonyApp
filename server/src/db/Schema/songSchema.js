const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, 'Unique ID is required'],
        ref: 'Unique ID from SoundCloud'
    },
    title: {
        type: String,
        required: [true, 'Song title is required']
    },
    artist: {
        type: [String],
        default: undefined //Ensures non-empty array
    },
    album: {
        type: String,
        required: [true, 'Album is required']
    },
    embedLink: {
        type: String,
        required: [true, 'Song URL is required']
    },
    imageLink: {
        type: String,
        default: ""
    },
    likes: {
        type: Number,
        default: 0
    }
})

module.exports = songSchema