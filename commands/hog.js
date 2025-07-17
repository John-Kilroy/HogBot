module.exports = {
    name: 'hog',
    check: (msg) => /\bhog\b/i.test(msg.content),
    execute: (msg) => {
        const replies = [
            "Did someone say hog?",
            "You called?",
            "Looking for me handsome?",
            "I'm listening...",
            "Don't go bacon my heart!",
            "Let's bring home the bacon",
            "I'm hog-wild for this idea",
            "Stop hamming it up!",
            "Sow what?",
            "You're really hogging the spotlight",
            "You're swine and dandy",
            "Sure, that'll happen when pigs fly!",
            "You're porktunate to know me",
            "Hog to meet you"
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        return msg.channel.send(reply);
    }
};
