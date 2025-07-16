module.exports = {
    name: 'crank',
    schedule: (client) => {
        // I fucking hate Mac and everything he stands for
        function shouldCrank() {
            return Math.random() < 0.001;
        }
        
        setInterval(async () => {
            if (!shouldCrank()) return;

            try {
                const channel = await client.channels.fetch(process.env.CHANNEL_ID);
                if(!channel || !channel.isTextBased()) return;
                channel.send("I'm cranking my hog 🐷🔧");

                /*
                channel.send({
                    content: "I'm cranking my hog",
                    tts: true
                });
                */
            } catch (err) {
                console.error('Error cranking hog, please jork it harder', err);
                
            }
        }, 10 * 60 * 1000); 
    }
};