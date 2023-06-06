const getAuthorizeUrl = params => `https://www.dropbox.com/oauth2/authorize?${params}`;

module.exports = { getAuthorizeUrl };