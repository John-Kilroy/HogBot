const pointsManager = require ('../utils/pointsManager');
const suits = ['♠️','♥️','♦️','♣️'];
const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

function drawCard() {
    const suit = suits[Math.floor(Math.random()*suits.length)];
    const rank = ranks[Math.floor(Math.random()*ranks.length)];
    return { text: `${rank}${suit}`, value: rank === 'A'?11: ['J','Q','K'].includes(rank)?10:parseInt(rank) };
}

async function playBlackJack(msg, bet) {
    let playerHand = [drawCard(), drawCard()];
    let dealerHand = [drawCard(), drawCard()];
    let playerTotal = handTotal(playerHand);
    let dealerTotal = handTotal(dealerHand);

    // Deduct Bet
    pointsManager.changePoints(msg.author.id, -bet);

    let content = `Your hand; ${playerHand.map(c=>c.text).join(' ')} (Total: ${playerTotal})\n`
                + `Dealer: ${dealerHand[0].text} ❓`;
    const gameMsg = await msg.channel.send(content);

    // Hit / Stand
    await gameMsg.react('🃏'); // hit
    await gameMsg.react('✋'); // stand

    const filter = (reaction, user) => ['🃏','✋'].includes(reaction.emoji.name) && user.id === msg.author.id;
    while (true) {
        const collected = await gameMsg.awaitReactions({ filter, max:1, time:60000 });
        const choice = collected.first()?.emoji.name;

        if (choice === '🃏') {
            playerHand.push(drawCard());
            playerTotal = handTotal(playerHand);
            await gameMsg.edit(content = buildContent());

            if(playerTotal > 21) return endGame('bust');

            await gameMsg.reactions.removeAll();
            await gameMsg.react('🃏');
            await gameMsg.react('✋');
        } else {
        return endGame();
    }
}

    function handTotal(hand) {
        let total = hand.reduce((sum,c) => sum + c.value,0);
        // Ace logic
        let aces = hand.filter(c => c.value === 11).length;
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        return total;
    }

    function buildContent() {
        return `Your hand; ${playerHand.map(c=>c.text).join(' ')} (Total: ${playerTotal})\n`
                + `Dealer: ${dealerHand[0].text} ❓`;
    }

    async function endGame(reason) {
        // Reveal Dealer
        while(dealerTotal < 17) {
            dealerHand.push(drawCard());
            dealerTotal = handTotal(dealerHand);
        }
        let result, payout = 0;
        if (reason === 'bust' || (dealerTotal <= 21 && dealerTotal > playerTotal)) result = 'lose';
        else if (playerTotal === dealerTotal) result = 'push';
        else result = 'win';

        if (result === 'win') payout = bet * 2;
        else if (result === 'push') payout = bet;
        pointsManager.changePoints(msg.author.id, payout);

        const final = `Your hand: ${playerHand.map(c=>c.text).join(' ')} (${playerTotal})\n`
                + `Dealer hand: ${dealerHand.map(c=>c.text).join(' ')} (${dealerTotal})\n`
                + (result==='win'?`🎉 You win ${payout-bet} points!`:
                   result==='push'?`➖ Push. You get your ${bet} back.`:
                   `💥 You lose.`);
        return gameMsg.edit(final);
    }
}

module.exports = {
    name: 'blackjack',
    async execute(msg, args) {
        const bet = parseInt(args[0], 10);
        if(!bet || bet <= 0) return msg.reply('Usage: `!blackjack <bet>`');
        if(bet>pointsManager.getPoints(msg.author.id)) return msg.reply("You don't have enough points brokeass bitch.");
        return playBlackJack(msg,bet);
    }
};
