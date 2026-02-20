const stt = require('./stt');
const tts = require('./tts');
const openai = require('../utils/openai');
const { createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const { spawn } = require('child_process');
const { Readable } = require('stream');

let ffmpegPath;
try { ffmpegPath = require('ffmpeg-static'); } catch (e) { ffmpegPath = 'ffmpeg'; }

// Match the regex name from stt.js
const WAKE = /(hey|hi|yo|ok)\s+(hog\s*bot|hog\s*butt|hawk\s*bot|hot\s*bot|hog\s*pot|hug\s*but)/i;

function start(connection) {
  stt.attachVoiceReceiver(connection);

  stt.onTranscript(async (text) => {
    // We already know it has a wake word because STT filtered it
    console.log("🔥 Wake word triggered! Handling response...");
    await handleWake(connection, text);
  });
}

async function handleWake(connection, originalText) {
  // Clean the text of the wake word
  const cleaned = originalText.replace(WAKE, '').trim() || 'Hello';
  
  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini', 
      messages: [
        { 
          role: 'system', 
          content: 'You are HogBot, a sly capitalist pig who hates Jeremy, only mention Jeremy if it is relevant. Keep it short.' 
        },
        { role: 'user', content: cleaned }
      ],
      max_tokens: 150,
    });
    
    const replyText = resp.choices?.[0]?.message?.content;
    console.log(`[DEBUG] HogBot response: ${replyText}`);

    let audioBuf = await tts.elevenTTS(replyText).catch(() => tts.googleTtsFallback(replyText));
    if (audioBuf) playBufferInConnection(connection, audioBuf);

  } catch (e) {
    console.error('[DEBUG] GPT Error:', e.message);
  }
}

function playBufferInConnection(connection, buffer) {
  const bufferStream = Readable.from(buffer);
  const ff = spawn(ffmpegPath, [
    '-loglevel', 'quiet', '-i', 'pipe:0', '-f', 's16le', '-ar', '48000', '-ac', '2', 'pipe:1'
  ], { stdio: ['pipe', 'pipe', 'ignore'], shell: false });

  ff.on('error', err => {
    if (ffmpegPath !== 'ffmpeg') {
      ffmpegPath = 'ffmpeg';
      playBufferInConnection(connection, buffer);
    }
  });

  bufferStream.pipe(ff.stdin);
  const resource = createAudioResource(ff.stdout, { inputType: StreamType.Raw, inlineVolume: true });
  const player = createAudioPlayer();
  connection.subscribe(player);
  player.play(resource);
}

module.exports = { start };