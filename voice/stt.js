require("dotenv").config();
const WebSocket = require("ws");
const prism = require("prism-media");
const { EndBehaviorType } = require("@discordjs/voice");

let ws = null;
const OPENAI_KEY = process.env.OPEN_API_KEY;
let transcriptCallback = null;

function connect() {
  console.log("[STT] Connecting to OpenAI...");
  ws = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview", {
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "OpenAI-Beta": "realtime=v1",
    },
  });

  ws.on("open", () => {
    console.log("[STT] Connected.");
    ws.send(JSON.stringify({
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        input_audio_transcription: { model: "whisper-1" },
        input_audio_format: "pcm16",
        turn_detection: null,
      },
    }));
  });

  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.type === "conversation.item.input_audio_transcription.completed" && transcriptCallback) {
      // Pass the text back to listener.js
      transcriptCallback(msg.transcript);
    }
  });

  ws.on("close", () => setTimeout(connect, 5000));
}

// This allows listener.js to hook into the transcript event
function onTranscript(cb) {
  transcriptCallback = cb;
}

function attachVoiceReceiver(connection) {
  const receiver = connection.receiver;
  receiver.speaking.on("start", (userId) => {
    const opusStream = receiver.subscribe(userId, {
      end: { behavior: EndBehaviorType.AfterSilence, duration: 1000 },
    });

    const pcmStream = opusStream.pipe(new prism.opus.Decoder({ rate: 24000, channels: 1, frameSize: 960 }));

    pcmStream.on("data", (chunk) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: chunk.toString("base64") }));
      }
    });

    pcmStream.on("end", () => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
        ws.send(JSON.stringify({ type: "response.create" }));
      }
    });
  });
}

connect(); // Start connection on load

// THE FIX: Exporting both functions so listener.js can use them
module.exports = { attachVoiceReceiver, onTranscript };