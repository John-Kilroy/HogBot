const pointsManager = require('../utils/pointsManager');
module.exports = {
    name: 'points',
    execute(msg) {
        const uid = msg.author.id;
        const pts = pointsManager.getPoints(uid);
        return msg.channel.send(`You have ${pts} points.`);
    }
};