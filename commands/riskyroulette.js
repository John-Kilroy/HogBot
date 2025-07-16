module.exports = {
    name: 'riskyroulette',
    async execute(msg) {
        const{ PermissionsBitField } = require('discord.js');
        // Kicks mf's  
        const isDead = () => Math.floor(Math.random() * 6) === 0;
        // Check perms
        if(!msg.guild.members.me.permissions.has('KickMembers')) {
            return msg.reply("I can't kick people because the owner of this server is lame and a loser");
        }

        // Check kickability of the freak
        const member = msg.member;
        if (!member.kickable) {
            return msg.reply("Guh, you, you're too powerful for this hog!");
        }

        // Yippie! Gameplay
        if (isDead()) {
            await msg.reply('You pull the trigger... 💥 BYE BYE IDIOT!');
            try {
                await member.kick('Lost Russian Roulette like a moron with skill diff issues');
                console.log("kicked ${member.user.tag} for losing russian roulette");
            } catch (err) {
                console.error('Failed to kick:', err);
                msg.channel.send("Well shit, you lived this time due to Jack's shitty programming");
            }
        } else {
            msg.reply('You pull the trigger... *click* You live this time! 😅');
        }
    }
};