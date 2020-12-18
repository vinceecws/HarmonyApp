const mongoose = require('mongoose')
const paginator = require('./plugin.js').paginationPlugin

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
    },
    image: {
        data: String,
        contentType: String
    }
})

collectionSchema.plugin(paginator, {
    limit: 10
})

collectionSchema.post('findOneAndRemove', function (next) {
    this.model('userSchema').updateMany({}, {
        $pull: {
            likedSongs: this._id
        }
    })
    next()
})

module.exports = collectionSchema