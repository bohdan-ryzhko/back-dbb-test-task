const express = require("express");
const { MongoClient } = require("mongodb");
const queryString = require("querystring");
const https = require("https");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");

const { client_id, client_secret, redirect_uri } = require("../utils/dropboxHelper");
const { getAuthorizeUrl } = require("../utils/getAuthorizeUrl");
const { handleSuccessRequest } = require("../utils/handleSuccessRequest");
const { handleErrorRequest } = require("../utils/handleErrorRequest");
const { REDIRECT, AUTHORIZE, FOLDERS } = require("../constants/paths");
const { DB_URL, USER_FOLDERS } = require("../utils/connectionsDB");

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

router.get(FOLDERS, async (req, res) => {
	const { email } = req.query;

	if (!email) {
		return res.status(400).json({ error: "Email parameter is missing" });
	}

	try {
		const client = new MongoClient(DB_URL, { useUnifiedTopology: true });
		await client.connect();

		const db = client.db();
		const collection = db.collection(USER_FOLDERS);

		const user = await collection.findOne({ email });

		await client.close();

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		return res.json(user);
	} catch (error) {
		console.error("Error connecting to database:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
});

module.exports = { router };
