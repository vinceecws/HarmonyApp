import * as icons from '../test'
const _ = require('lodash');
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
            suggestions: JSON.parse(JSON.stringify(sampleDatabase.users))
        }, 
        {
            categoryName: "Recently Streamed",
            suggestions: JSON.parse(JSON.stringify(sampleDatabase.sessions))
        },
        {
            categoryName: "Recommended For You",
            suggestions: JSON.parse(JSON.stringify(sampleDatabase.collections))
        },
        {
            categoryName: "Listen Again",
            suggestions: JSON.parse(JSON.stringify(sampleDatabase.songs))
        }
    ]
}

export function genSampleImage () {
    let keys = Object.keys(icons);
    return icons[keys[Math.floor(Math.random() * (keys.length - 1))]];
}

/* Will get stuck in an infinite loop if numItems > number of elements actually in the sample database */
export function genSampleHistory (numItems) {
    let sampleDatabaseCopy = JSON.parse(JSON.stringify(sampleDatabase))
    let categorykeys = Object.keys(sampleDatabaseCopy);
    let sampleHistory = []
    var i = 0
    while (sampleHistory.length < numItems){
        var categoryName = categorykeys[categorykeys.length * Math.random() << 0]
        if (sampleDatabaseCopy[categoryName].length > 0){
            var history = sampleDatabaseCopy[categoryName].pop()
            history.index = i
            sampleHistory.push(history)
            i++
        }
    }

    return sampleHistory
}

export function genSampleResults (query) {

    var sampleDatabaseCopy = JSON.parse(JSON.stringify(sampleDatabase))

    return [
        {   
            categoryName: "Sessions",
            results: sampleDatabaseCopy.sessions.filter(item => item.name.toLowerCase().includes(query) || item.hostName.toLowerCase().includes(query))
        },
        {
            categoryName: "Collections",
            results: sampleDatabaseCopy.collections.filter(item => item.name.toLowerCase().includes(query) || item.user.toLowerCase().includes(query))
        },
        {
            categoryName: "Songs",
            results: sampleDatabaseCopy.songs.filter(item => item.name.toLowerCase().includes(query) || item.artist.toLowerCase().includes(query))
        },
        {
            categoryName: "Users",
            results: sampleDatabaseCopy.users.filter(item => item.name.toLowerCase().includes(query))
        }
    ]
}

export function genSampleQueue () {
    var songsCopy = _.cloneDeep(sampleDatabase.songs)
    
    /* Fisher-Yates shuffle from https://medium.com/@nitinpatel_20236/how-to-shuffle-correctly-shuffle-an-array-in-javascript-15ea3f84bfb */
    for (let i = songsCopy.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * i)
        const temp = songsCopy[i]
        songsCopy[i] = songsCopy[j]
        songsCopy[j] = temp
      }
    return songsCopy
}
