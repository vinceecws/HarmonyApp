import * as icons from '../test'
let sessions = require('./sampleSessions.json')
let collections = require('./sampleCollections.json')
let songs = require('./sampleSongs.json')
let users = require('./sampleUsers.json')

/*
    Sample data initialization
*/

function initType(category, categoryName) {
    for (var i = 0; i < category.length; i++) {
        category[i].type = categoryName
    }
    return category
}

function initCreator(category) {
    for (var i = 0; i < category.length; i++) {
        switch(category[i].type) {
            case "session":
                category[i].creator = category[i].hostName
                break;
            case "collection":
                category[i].creator = category[i].user
                break;
            case "song":
                category[i].creator = category[i].artist
                break;
            case "user":
            default:
                category[i].creator = ""
                break;
        }
    }
    return category
}

function initImage(category) {
    for (var i = 0; i < category.length; i++) {
        category[i].image = genSampleImage()
    }
    return category
}

function initData(category, categoryName) {
    var initFunctions = [initType, initCreator, initImage]
    for (var i = 0; i < initFunctions.length; i++) {
        category = initFunctions[i](category, categoryName)
    }
    return category
}

let sampleDatabase = {
    sessions: initData(sessions, "session"),
    collections: initData(collections, "collection"),
    songs: initData(songs, "song"),
    users: initData(users, "user")
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

export function genSampleImage () {
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
        history.index = i
        sampleHistory.push(history)
    }

    return sampleHistory
}

export function genSampleResults (query) {
    return [
        {   
            categoryName: "Sessions",
            results: sampleDatabase.sessions.filter(item => item.name.toLowerCase().includes(query) || item.hostName.toLowerCase().includes(query))
        },
        {
            categoryName: "Collections",
            results: sampleDatabase.collections.filter(item => item.name.toLowerCase().includes(query) || item.user.toLowerCase().includes(query))
        },
        {
            categoryName: "Songs",
            results: sampleDatabase.songs.filter(item => item.name.toLowerCase().includes(query) || item.artist.toLowerCase().includes(query))
        },
        {
            categoryName: "Users",
            results: sampleDatabase.users.filter(item => item.name.toLowerCase().includes(query))
        }
    ]
}
