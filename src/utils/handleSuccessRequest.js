const queryString = require("querystring");
const fs = require("fs").promises;
const path = require("path");

const { getRedirectUrl } = require("../utils/getRedirectUrl");

const authPath = path.join(process.cwd(), "src", "auth", "auth.json");

const handleSuccessRequest = res => response => {
	const chunks = [];

	response.on("data", (chunk) => {
		chunks.push(chunk);
	});

	response.on("end", async () => {
		const responseData = Buffer.concat(chunks).toString();

		const parsedData = JSON.parse(responseData);
		await fs.writeFile(authPath, JSON.stringify(parsedData, null, 2));

		const query = queryString.stringify({ auth: true });
		res.redirect(getRedirectUrl(query));
	});
}

module.exports = { handleSuccessRequest };