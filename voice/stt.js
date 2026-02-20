require("dotenv").config();
const WebSocket = require("ws");
const prism = require("prism-media");
const { EndBehaviorType } = require("@discordjs/voice");
const { spawn } = require('child_process');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { Readable } = require('stream');

let ffmpegPath;
try { ffmpegPath = require('ffmpeg-static'); } catch (e) { ffmpegPath = 'ffmpeg'; }

let ws = null;
let transcriptCallback = null;
const API_KEY = process.env.OPEN_API_KEY; 

// Add the Fuzzy Wake Word Detection here
const WAKE = /(hey|hi|yo|ok)\s+(hog\s*bot|hog\s*butt|hawk\s*bot|hot\s*bot|hog\s*pot|hug\s*but)/i;

// We use a Map to track active streams so we can kill them properly
const activeStreams = new Map();

function connect() {
  console.log("[STT] Connecting to OpenAI...");
  ws = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
    headers: { Authorization: `Bearer ${API_KEY}`, "OpenAI-Beta": "realtime=v1" },
  });

  ws.on("open", () => {
    console.log("[STT] ✅ BANK ACCOUNT PROTECTED: Manual turn detection enabled.");
    ws.send(JSON.stringify({
      type: "session.update",
      session: {
        modalities: ["text"],
        input_audio_transcription: { model: "whisper-1" },
        // CHANGE: Disable server_vad so OpenAI doesn't charge for idle listening
        turn_detection: null 
      },
    }));
  });

  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());
    
    // This event only fires when we MANUALLY tell it to transcribe
    if (msg.type === "conversation.item.input_audio_transcription.completed") {
      const text = msg.transcript.trim();
      const WAKE = /(hey|hi|yo|ok)\s+(hog\s*bot|hog\s*butt|hawk\s*bot|hot\s*bot|hog\s*pot|hug\s*but)/i;

      if (WAKE.test(text)) {
        console.log(`\n[HogBot] Triggered by: "${text}"`);
        if (transcriptCallback) transcriptCallback(text);
      } else {
        // If it was just background noise, we stop here. 
        // We've already paid for the Whisper transcription (cheap),
        // but we saved the GPT-4 response cost (expensive).
        console.log(`[HogBot] Ignored background noise: "${text}"`);
      }
    }
  });
}

function attachVoiceReceiver(connection) {
  const receiver = connection.receiver;
  receiver.speaking.removeAllListeners("start");

  receiver.speaking.on("start", (userId) => {
    if (activeStreams.has(userId)) return;

    let bytesSent = 0;
    const opusStream = receiver.subscribe(userId, {
      end: { behavior: EndBehaviorType.AfterSilence, duration: 1200 } // Tighter silence window
    });

    const decoder = new prism.opus.Decoder({ rate: 48000, channels: 1, frameSize: 960 });
    const resampler = spawn(ffmpegPath, [
      '-f', 's16le', '-ar', '48000', '-ac', '1', '-i', 'pipe:0',
      '-f', 's16le', '-ar', '24000', '-ac', '1', 'pipe:1'
    ]);

    activeStreams.set(userId, { opusStream, decoder, resampler });
    opusStream.pipe(decoder).pipe(resampler.stdin);

    resampler.stdout.on("data", (chunk) => {
      if (ws?.readyState === WebSocket.OPEN) {
        bytesSent += chunk.length;
        ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: chunk.toString("base64") }));
      }
    });

    opusStream.on("end", () => {
      if (bytesSent > 4000 && ws?.readyState === WebSocket.OPEN) {
        // ONLY NOW do we tell OpenAI to look at the buffer
        ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
        // Note: We do NOT send response.create here. 
        // We wait for the transcript to come back first in ws.on("message").
      }
      resampler.kill();
      decoder.destroy();
      activeStreams.delete(userId);
    });
  });
}

connect();
module.exports = { attachVoiceReceiver, onTranscript: (cb) => { transcriptCallback = cb; } };