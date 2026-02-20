const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
const googleTTS = require('google-tts-api');

async function elevenTTS(text, options = {}) {
  if (!ELEVEN_KEY) return null;

  // VoiceID options from elevenlabs: https://api.elevenlabs.io/v1/voices
  const voiceId = 'N2lVS1w4EtoT3dr4eOWO'; 
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  
  const body = {
    text,
    model_id: 'eleven_flash_v2_5', 
    voice_settings: { stability: 0.5, similarity_boost: 0.8 }
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVEN_KEY,
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`ElevenLabs API Error: ${resp.status} - ${txt}`);
  }

  const arrayBuffer = await resp.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function googleTtsFallback(text) {
  // 1. Split the long text into an array of smaller URLs
  const results = googleTTS.getAllAudioUrls(text, { 
    lang: 'en', 
    slow: false, 
    host: 'https://translate.google.com' 
  });
  
  const buffers = [];
  
  // 2. Fetch the audio for each chunk
  for (const result of results) {
    const r = await fetch(result.url); // Native fetch again
    const ab = await r.arrayBuffer();
    buffers.push(Buffer.from(ab));
  }
  
  // 3. Concatenate all the chunk buffers into one final playable buffer
  return Buffer.concat(buffers);
}

module.exports = { elevenTTS, googleTtsFallback };