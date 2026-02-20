const MEM = {}; // { guildId: { channelId: [ {userId, role, text, ts} ] } }
const MAX_ITEMS = 20;

function push(guildId, channelId, entry) {
  MEM[guildId] = MEM[guildId] || {};
  MEM[guildId][channelId] = MEM[guildId][channelId] || [];
  MEM[guildId][channelId].push({ ...entry, ts: Date.now() });
  // trim
  while (MEM[guildId][channelId].length > MAX_ITEMS) MEM[guildId][channelId].shift();
}

function getHistory(guildId, channelId) {
  return (MEM[guildId] && MEM[guildId][channelId]) ? MEM[guildId][channelId] : [];
}

function clear(guildId, channelId) {
  if (MEM[guildId]) MEM[guildId][channelId] = [];
}

module.exports = { push, getHistory, clear };