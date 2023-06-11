const queryString = require("querystring");
const { client_id, client_secret } = require("../utils/dropboxHelper");

const getTokenParams = (req, redirect_uri) => {
	const params = queryString.stringify({
		code: req.query.code,
		grant_type: "authorization_code",
		redirect_uri,
		client_id,
		client_secret,
	});

	const options = {
		hostname: "api.dropbox.com",
		path: "/oauth2/token",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	};

	return { params, options }
}

module.exports = { getTokenParams };