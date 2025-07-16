module.exports = {
    name: 'hog',
    check: (msg) => /\bhog\b/i.test(msg.content),
    execute: (msg) => {
        const replies = [
            "Did someone say hog?",
            "You called?",
            "Looking for me handsome?",
            "I'm listening..."
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        return msg.channel.send(reply);
    }
};