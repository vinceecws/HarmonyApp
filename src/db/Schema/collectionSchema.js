const mongoose = require('mongoose')
const songSchema = require('./songSchema.js')

const collectionSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: [true, 'Collection name is required']
    },
    ownerId:{
        type: String,
        required: [true, 'Owner id is required'],
    },
    ownerName: {
        type: String,
        required: [true, 'Owner name is required'],
    },
    description: {
        type: String,
        default: ""
    },
    songList: {
        type: [String]
    },
    likes: {
        type: Number,
        default: 0
    }
})

module.exports = collectionSchema