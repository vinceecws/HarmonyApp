import * as icons from '../test'
let sessions = require('./sampleSessions.json')
let collections = require('./sampleCollections.json')
let songs = require('./sampleSongs.json')
let users = require('./sampleUsers.json')

let sampleDatabase = {
    sessions: sessions,
    collections: collections,
    songs: songs,
    users: users
}

/*
        Sample data generating functions
    */

export function genSampleSuggestions () {
    return [
        {
            categoryName: "Your Top Hosts",
            suggestions: sampleDatabase.users
        }, 
        {
            categoryName: "Recently Streamed",
            suggestions: sampleDatabase.sessions
        },
        {
            categoryName: "Recommended For You",
            suggestions: sampleDatabase.collections
        },
        {
            categoryName: "Listen Again",
            suggestions: sampleDatabase.songs
        }
    ]
}

export function genSampleImage (obj) {
    let keys = Object.keys(icons);
    return icons[keys[keys.length * Math.random() << 0]];
}

export function genSampleHistory (numItems) {
    let categorykeys = Object.keys(sampleDatabase);
    let sampleHistory = []
    for (var i = 0; i < numItems; i++) {
        var categoryName = categorykeys[categorykeys.length * Math.random() << 0]
        var category = sampleDatabase[categoryName]
        var keys = Object.keys(category)
        var history = category[keys[keys.length * Math.random() << 0]]
        history.type = categoryName.slice(0, -1)
        history.index = i
        sampleHistory.push(history)
    }

    return sampleHistory
}

export function genSampleResults (query) {
    return {
        sessions: sampleDatabase.sessions.filter(item => item.name.includes(query)),
        collections: sampleDatabase.collections.filter(item => item.name.includes(query)),
        songs: sampleDatabase.songs.filter(item => item.name.includes(query)),
        users: sampleDatabase.users.filter(item => item.name.includes(query))
    }
}
