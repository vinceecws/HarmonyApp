const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
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
    }
})

module.exports = songSchema