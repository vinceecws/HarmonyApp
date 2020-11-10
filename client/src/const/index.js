export const youtube_data_api_src = "https://apis.google.com/js/api.js"
export const youtube_iframe_api_src = 'https://www.youtube.com/iframe_api'
export const youtube_data_api_discovery_doc = "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"
export const youtube_data_api_oauth_scope = "https://www.googleapis.com/auth/youtube"
export const google_oauth2_src = "https://apis.google.com/js/platform.js"

/*
    Probably a good idea to move this to server.js for security purposes
*/
export const youtube_data_api_key = 'AIzaSyD2baf28I9I_FGcSCKay1GARnAMghlcQW0'
export const google_oauth2_client_id = '1062386445238-hpt4garm04t6lfcn82brmbic5gng7u8i.apps.googleusercontent.com'

/*
    The 7 screens of the app
*/
export const screens = {
    'LOGIN': 0,
    'HOME': 1,
    'SESSION': 2,
    'SEARCH': 3,
    'PROFILE': 4,
    'COLLECTION': 5,
    'SETTINGS': 6
}

/*
    The 3 states of repeat in the music player
*/
export const repeatStates = {
    'OFF' : 0,
    'SONG' : 1,
    'QUEUE' : 2
}

/*
    The lowest-level, atomic actions that can be taken on the queue.
    Every higher-level function such as shuffle, repeat, play, pause will be implemented on top of these.
*/
export const queueActionTypes = {
    'ADD_SONG': 0,
    'REMOVE_SONG': 1,
    'PUSH_SONG_INTO_PLAYER': 2,
    'PULL_SONG_FROM_PLAYER': 3,
    'REPOSITION_SONG': 4,
}

/*
    The lowest-level, atomic actions that can be taken on the player.
    Every higher-level function such as shuffle, repeat, play, pause will be implemented on top of these.
*/
export const playerActionTypes = {
    'PLAY_SONG': 0,
    'PAUSE_SONG': 1,
    'NEXT_SONG': 2,
    'PREV_SONG': 3,
    'TOGGLE_SHUFFLE': 4,
    'TOGGLE_REPEAT': 5,
    'SEEK': 6,
}