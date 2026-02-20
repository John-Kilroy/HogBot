const voice = require('../voice');

module.exports = {
  name: 'join',
  async execute(msg) {
    voice.join(msg);
    msg.reply('HogBot has entered the chat. Try saying "Hey HogBot".');
  }
};