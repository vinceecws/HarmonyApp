const SoundCloudAudio = require('soundcloud-audio');
 
// create new instance of audio
// clientId is optional but without it you cannot play tracks directly from SoundCloud API
const scPlayer = new SoundCloudAudio('YOUR_CLIENT_ID');
 
// if you have a SoundCloud api stream url you can just play it like that
scPlayer.play({
  streamUrl: 'https://api.soundcloud.com/tracks/185533328/stream'
});
 
// OR if you want to play a NON-SoundCloud audio
scPlayer.play({ streamUrl: 'https://example.com/plain/audio/file' });
 
// OR if you need to load a SoundCloud track and resolve it's data
scPlayer.resolve('https://soundcloud.com/djangodjango/first-light', function(
  track
) {
  // do smth with track object
  // e.g. display data in a view etc.
  console.log(track);
 
  // once track is loaded it can be played
  scPlayer.play();
 
  // stop playing track and keep silence
  scPlayer.pause();
});