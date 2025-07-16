const pointsManager = require('../utils/pointsManager');
module.exports = {
    name: 'roulette',
    async execute(msg, args) {
        const uid = msg.author.id;
        const bet = parseInt(args[0], 10);
        if(isNaN(bet)|| bet <= 0) return msg.reply('Usage: `!roulette <amount>`');

        let pts = pointsManager.getPoints(uid);
        if (bet > pts) return msg.reply(`You only have ${pts} points.`);

        const isDead = () => Math.floor(Math.random() * 6) === 0;
        if (isDead()) {
            const remaining = pointsManager.changePoints(uid, -bet);
            msg.reply(`You pull the trigger... 💥 You died like a fool! You lost ${bet} points. You now have ${remaining}.`);
        } else {
            const winAmt = bet;
            const total = pointsManager.changePoints(uid, winAmt);
            msg.reply(`You pull the trigger... *click* You live this time! 😅 You won ${winAmt} points. Total: ${total}.`);
        }
    }
};