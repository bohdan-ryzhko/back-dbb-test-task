const getParseChunks = chunks => JSON.parse(Buffer.concat(chunks).toString());

module.exports = { getParseChunks };
