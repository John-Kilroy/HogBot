const fs = require('fs');
const OpenAI = require('openai');
require('dotenv').config();
const key = process.env.OPEN_API_KEY || process.env.OPENAI_API_KEY;
if (!key) { console.error('No key'); process.exit(1); }
const openai = new OpenAI({ apiKey: key });
(async () => {
  try {
    // This is a minimal REST call that *should* work if the key is valid
    const r = await openai.models.list();
    console.log('models ok, count:', r.data?.length ?? 'unknown');
  } catch (e) {
    console.error('REST test failed:', e?.message || e);
  }
})();