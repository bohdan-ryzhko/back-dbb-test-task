const express = require("express");
const queryString = require("querystring");
const https = require("https");
const { v4: uuidv4 } = require("uuid");
const cors = require('cors');
const { client_id, client_secret, redirect_uri } = require("./dropboxHelper");
const { handleRequest } = require("./handleRequest");

const app = express();
const PORT = 3001;
const uniqueId = uuidv4();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// http://localhost:3001/redirect

app.get("/redirect", (req, res) => {
	const params = queryString.stringify({
		client_id,
		response_type: "code",
		redirect_uri,
		state: uniqueId,
	});

	const authorizeUrl = `https://www.dropbox.com/oauth2/authorize?${params}`;

	res.redirect(authorizeUrl);
});

app.get("/authorize", (req, res) => {
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

	const request = https.request(options, (response) => {
		const chunks = [];

		response.on("data", (chunk) => {
			chunks.push(chunk);
		});

		response.on("end", () => {
			const responseData = Buffer.concat(chunks);
			const data = responseData.toString();
			const query = queryString.stringify(JSON.parse(data));
			console.log(query);
			res.redirect("http://localhost:3000/dbb-test-task?data=" + query);
		});
	});

	request.on("error", (error) => {
		console.error("Request error:", error);
		res.status(500).end("Internal Server Error");
	});

	request.write(params);
	request.end();
});


app.listen(PORT, () => console.log(`Server listen on ${PORT}`));
