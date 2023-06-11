const getRedirectUrl = query => `http://localhost:3000/dbb-test-task?${query}`;

const getRedirectUrlCreateFolder = query => `http://localhost:3000/dbb-test-task/files?${query}`

module.exports = { getRedirectUrl, getRedirectUrlCreateFolder };