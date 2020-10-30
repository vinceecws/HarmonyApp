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