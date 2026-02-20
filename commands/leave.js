const voice = require('../voice');

module.exports = {
  name: 'leave',
  async execute(msg) {
    voice.leave(msg.guild.id);
    msg.reply('Goodbye! HogBot has left the voice channel.');
  }
};