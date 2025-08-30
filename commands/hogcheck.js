const statsManager = require('../utils/statsManager');

module.exports = {
    name: 'hogcheck',
    async execute(msg) {
        const count = statsManager.getCrankCount();
        return msg.channel.send(`HogBot has cranked **${count}** time${count === 1 ? '' : 's'}!`);
    }
};
