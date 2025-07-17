module.exports = {
    name: 'fact',
    check: (msg) => /\bfact\b/i.test(msg.content),
    execute: (msg) => {
        const replies = [
            "Pigs can recognize themselves in mirrors, but only if the mirror is placed at snout level.",
            "A fully grown hog can remember over 100 individual sounds, including human names and door creaks.",
            "Wild hogs are known to dig complex, spiral-shaped nests that always align to magnetic north.",
            "Pigs have been observed “singing” low-frequency hums when eating in groups — scientists call this “social dining resonance.”",
            "In cold climates, hogs fluff their bristles by vibrating tiny muscles in their skin — a process known as “porkulation.”",
            "During the 18th century, hogs were used in parts of Eastern Europe to sniff out counterfeit coins due to their acute sense of smell.",
            "A hog’s snout has over 10,000 tactile sensors, making it more sensitive than a human fingertip.",
            "In 1974, NASA briefly considered training pigs for zero-gravity waste management experiments.",
            "Pigs cannot look directly upward, but will tilt their heads and “snort-whistle” in response to overhead threats.",
            "The average hog can sprint faster than a professional baseball player over short distances — up to 12 mph.",
            "Some pig breeds “giggle” — they produce short, rhythmic grunts when content that resemble laughter.",
            "Pigs dream in color and often show twitch responses to visual stimuli during REM sleep, similar to dogs.",
            "Boars have been known to use sticks as tools — especially to scratch parts of their back that are hard to reach.",
            "The phrase “sweating like a pig” is inaccurate — pigs don’t sweat. But they do secrete a cooling fluid from glands in their hooves.",
            "When two pigs form a strong bond, they’ll often synchronize their snout movements when rooting in the soil.",
            "In parts of rural France, pigs are still used to find truffles, but are now outfitted with GPS collars and fitness trackers.",
            "Scientists believe hogs can sense earthquakes up to 12 hours before they happen by detecting low-frequency rumbles.",
            "Pigs can distinguish between jazz and classical music, and show a clear preference for jazz rhythms during feeding time.",
            "A pig’s sense of smell is so strong, it can detect underground mushrooms up to 3 feet deep.",
            "In high-altitude farms, pigs grunt more deeply due to lower oxygen levels, leading to local legends of “mountain growlers.”",
            "A group of hogs is called a “thunder,” due to the sound they make when stampeding together in the wild.",
            "Hog snouts contain over 3,000 nerve endings, making them more sensitive than human fingertips.",
            "Some ancient Roman households kept hogs as “fire alarms,” because they squealed loudly at the smell of smoke."
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        return msg.channel.send(reply);
    }
};
