exports.stripUser = function(user) {

    var strippedUser = {
        username: user.local ? user.local.username : user.google.name,
        _id: user._id, 
        biography: user.biography,
        privateMode: user.privateMode, 
        live: user.live,
        hosting: user.hosting,
        playlists: user.playlists, 
        sessions: user.sessions,
        history: user.history, 
        likedSongs: user.likedSongs,
        likedCollections: user.likedCollections,
        currentSession: user.currentSession,
        image: user.image
    }

    return strippedUser
}