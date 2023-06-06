const queryString = require("querystring");

const handleSuccessRequest = res => response => {
	const chunks = [];

	response.on("data", (chunk) => {
		chunks.push(chunk);
	});

	response.on("end", () => {
		const responseData = Buffer.concat(chunks).toString();
		const query = queryString.stringify(JSON.parse(responseData));
		res.redirect("http://localhost:3000/dbb-test-task?data=" + query);
	});
}

module.exports = { handleSuccessRequest };