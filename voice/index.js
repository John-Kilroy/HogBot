const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const listener = require('./listener');

function join(msg) {
  const vc = msg.member?.voice?.channel;
  if (!vc) {
    msg.reply('You must be in a voice channel.');
    return null;
  }

  const connection = joinVoiceChannel({
    channelId: vc.id,
    guildId: vc.guild.id,
    adapterCreator: vc.guild.voiceAdapterCreator,
    selfDeaf: false,
    selfMute: false
  });

  // Wait for the connection to be ready or just pass it to the listener
  listener.start(connection);
  
  return connection;
}

function leave(guildId) {
  const conn = getVoiceConnection(guildId);
  if (conn) conn.destroy();
}

module.exports = { join, leave };