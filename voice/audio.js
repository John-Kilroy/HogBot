const { spawn } = require('child_process');
const ffmpeg = require('ffmpeg-static');

// opusStream is the @discordjs/voice receiver.subscribe stream
// returns a readable stream of raw s16le PCM at 24000 Hz mono
function opusToPCM24000(opusStream) {
  const args = [
    '-loglevel', 'quiet',
    '-f', 'opus', '-i', 'pipe:0',
    '-ar', '24000', '-ac', '1',
    '-f', 's16le', 'pipe:1'
  ];
  const ff = spawn(ffmpeg, args, { stdio: ['pipe', 'pipe', 'ignore'] });
  opusStream.pipe(ff.stdin);
  return ff.stdout;
}

module.exports = { opusToPCM24000 };