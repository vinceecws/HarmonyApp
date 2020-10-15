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
        type: [mongoose.Schema.Types.ObjectId],
        ref: "songId"
    }
})

module.exports = collectionSchema