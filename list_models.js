const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPEN_API_KEY
});

(async () => {
  const res = await client.models.list();

  console.log('\n=== YOUR MODELS ===\n');

  res.data
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach(m => console.log(m.id));
})();