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

exports.paginate = function(list, page, limit=8) {
    var firstInd = (limit * (page - 1))
    var lastInd = firstInd + limit - 1
    var newList = list.slice(firstInd, lastInd + 1)
    
    var hasNextPage = (list.length - (page * limit)) > 0
    var hasPrevPage = page - 1 >= 1

    var nextPageToken = hasNextPage ? page + 1 : null
    var prevPageToken = hasPrevPage ? page - 1 : null

    return {
        list: newList,
        nextPageToken: nextPageToken,
        prevPageToken: prevPageToken
    }
}