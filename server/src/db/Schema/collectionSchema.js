const mongoose = require('mongoose')
const songSchema = require('./songSchema.js')

const collectionSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: [true, 'Collection name is required']
    },
    description: {
        type: String,
        default: ""
    },
    songList: {
        type: [String],
        ref: "songId"
    },
    likes: {
        type: Number,
        default: 0
    }
})

module.exports = collectionSchema