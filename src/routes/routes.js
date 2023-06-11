const express = require("express");
const { MongoClient } = require("mongodb");
const queryString = require("querystring");
const https = require("https");
const { v4: uuidv4 } = require("uuid");

const {
	REDIRECT,
	AUTHORIZE,
	FOLDERS,
	DELETE_USER,
	REDIRECT_CREATE,
	CREATE_FOLDER
} = require("../constants/paths");

const { client_id, redirect_uri, redirect_uri_create_folder } = require("../utils/dropboxHelper");
const { getAuthorizeUrl } = require("../utils/getAuthorizeUrl");
const { getTokenParams } = require("../utils/getTokenParams");
const { handleSuccessAthorization } = require("../handlers/handleSuccessAthorization");
const { handleError } = require("../handlers/handleError");
const { DB_URL, USER_FOLDERS } = require("../utils/connectionsDB");
const { handleSucessCreateFolder } = require("../handlers/handleSucessCreateFolder");

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

	const { params, options } = getTokenParams(req, redirect_uri);

	const request = https.request(options, handleSuccessAthorization(res));

	request.on("error", handleError(res));

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

router.delete(DELETE_USER, async (req, res) => {
	const { email } = req.params;

	try {
		const client = new MongoClient(DB_URL, { useUnifiedTopology: true });
		await client.connect();

		const db = client.db();
		const collection = db.collection(USER_FOLDERS);

		const result = await collection.deleteOne({ email });

		await client.close();

		if (result.deletedCount === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		return res.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Error connecting to database:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
});

router.get(REDIRECT_CREATE, (req, res) => {
	const { inputValue, email } = req.query;

	const params = queryString.stringify({
		client_id,
		response_type: "code",
		redirect_uri: redirect_uri_create_folder,
		state: `${inputValue}|${email}`,
	});

	res.redirect(getAuthorizeUrl(params));
});

router.get(CREATE_FOLDER, (req, res) => {
	if (req.query.error) return res.end(req.query.error_description);

	const [path, email] = req.query.state.split("|");

	const { params, options } = getTokenParams(req, redirect_uri_create_folder);

	const request = https.request(options, handleSucessCreateFolder({ res, path, email }));

	request.on("error", handleError(res));

	request.write(params);
	request.end();
});

module.exports = { router };
