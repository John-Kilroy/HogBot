const stt = require('./stt');
const tts = require('./tts');
const openai = require('../utils/openai');
const { createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const { spawn } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const { Readable } = require('stream');

const WAKE = /hey\s+hogbot/i;

function start(connection) {
  // 1. Attach the audio pipeline
  stt.attachVoiceReceiver(connection);

  // 2. Listen for transcripts from the STT module
  stt.onTranscript(async (text) => {
    if (!text) return;
    console.log(`[STT] Heard: "${text}"`);

    if (WAKE.test(text)) {
      console.log("🔥 Wake word detected!");
      await handleWake(connection, text);
    }
  });
}

async function handleWake(connection, originalText) {
  const cleaned = originalText.replace(WAKE, '').trim() || 'Hello';
  let replyText = 'Uhh... I do not feel like speaking.';

  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini', 
      messages: [
        { role: 'system', content: 'You are HogBot, a sly capitalist pig who hates Jeremy. Keep responses under 300 tokens.' },
        { role: 'user', content: cleaned }
      ],
      max_tokens: 200,
    });
    replyText = resp.choices?.[0]?.message?.content;
    console.log(`[DEBUG] HogBot says: ${replyText}`);
  } catch (e) {
    console.error('[DEBUG] GPT Error:', e.message);
  }

  let audioBuf = null;
  try {
    // Using "Bill" - a default ElevenLabs voice
    audioBuf = await tts.elevenTTS(replyText, { 
      voiceId: 'pqHfZKP75CvD9qycnA5d', 
      stability: 0.5, 
      similarity_boost: 0.75 
    });
  } catch (e) {
    console.error('[DEBUG] ElevenLabs failed (falling back):', e.message);
    audioBuf = await tts.googleTtsFallback(replyText);
  }

  if (audioBuf) {
    playBufferInConnection(connection, audioBuf);
  }
}

function playBufferInConnection(connection, buffer) {
  console.log(`[DEBUG] Attempting to play buffer of size: ${buffer.length}`);

  const bufferStream = Readable.from(buffer);

  // We convert MP3 -> Raw 16-bit PCM (s16le). 
  // Discord.js handles PCM much more reliably than raw Opus pipes.
  const ff = spawn(ffmpeg, [
    '-loglevel', 'quiet',
    '-i', 'pipe:0',
    '-f', 's16le',     // Output raw PCM
    '-ar', '48000',    // 48kHz
    '-ac', '2',        // Stereo
    'pipe:1'
  ], { stdio: ['pipe', 'pipe', 'ignore'] });

  bufferStream.pipe(ff.stdin);

  const resource = createAudioResource(ff.stdout, { 
    inputType: StreamType.Raw, // Changed from Opus to Raw
    inlineVolume: true 
  });
  
  resource.volume?.setVolume(1.0);

  const player = createAudioPlayer();
  connection.subscribe(player);
  player.play(resource);

  player.on('stateChange', (oldState, newState) => {
    console.log(`[DEBUG] AudioPlayer: ${oldState.status} -> ${newState.status}`);
  });

  player.on('error', err => {
    console.error('[DEBUG] Player Error:', err.message);
  });

  ff.on('error', err => console.error('[DEBUG] FFmpeg Error:', err));
}

module.exports = { start };