const express = require("express");
const queryString = require("querystring");
const https = require("https");
const { v4: uuidv4 } = require("uuid");

const { client_id, client_secret, redirect_uri } = require("../utils/dropboxHelper");
const { getAuthorizeUrl } = require("../utils/getAuthorizeUrl");
const { handleSuccessRequest } = require("../utils/handleSuccessRequest");
const { handleErrorRequest } = require("../utils/handleErrorRequest");
const { REDIRECT, AUTHORIZE } = require("../constants/paths");

const uniqueId = uuidv4();

const router = express.Router();

router.get(REDIRECT, (req, res) => {
	const params = queryString.stringify({
		client_id,
		response_type: "code",
		redirect_uri,
		state: uniqueId,
	});

	res.redirect(getAuthorizeUrl(params));
});

router.get(AUTHORIZE, (req, res) => {
	if (req.query.error) return res.end(req.query.error_description);

	if (req.query.state !== uniqueId) return res.end("Wrong uniqueId");

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

	const request = https.request(options, handleSuccessRequest(res));

	request.on("error", handleErrorRequest(res));

	request.write(params);
	request.end();
});

module.exports = { router };