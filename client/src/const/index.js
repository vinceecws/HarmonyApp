export const youtube_data_api_src = "https://apis.google.com/js/api.js"
export const youtube_iframe_api_src = 'https://www.youtube.com/iframe_api'
export const youtube_data_api_discovery_doc = "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"
export const youtube_data_api_oauth_scope = "https://www.googleapis.com/auth/youtube"
export const google_oauth2_src = "https://apis.google.com/js/platform.js"

export const google_oauth2_client_id = '1062386445238-hpt4garm04t6lfcn82brmbic5gng7u8i.apps.googleusercontent.com'
export const youtube_data_api_key = 'AIzaSyCKvYfEin1awnmOsWcp9hX4p_RJfUxjn5c'
// export const youtube_data_api_key = 'AIzaSyD-2c6FfEFVQPtlODrQ8Q7_wWhK_tuSl5w'
// export const youtube_data_api_key = 'AIzaSyAAvijnMt1vaI6Z2gwSJE-MOCoygHwSEvM' //Sebastian's

/*
    The 6 screens of the main app
*/
export const mainScreens = {
    'HOME': 0,
    'SESSION': 1,
    'SEARCH': 2,
    'PROFILE': 3,
    'COLLECTION': 4,
    'SETTINGS': 5
}

/*
    The Different Role types of a user in a Session
*/
export const sessionRoles = {
    'USER_PUBLIC_HOST': 0,
    'USER_PRIVATE_HOST': 1,
    'USER_PARTICIPANT': 2,
    'USER_NON_PARTICIPANT': 3,
    'GUEST_PARTICIPANT': 4,
    'GUEST_NON_PARTICIPANT': 5
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