const handleRequest = res => response => {
	const chunks = [];

	response.on("data", (chunk) => {
		chunks.push(chunk);
	});

	response.on("end", () => {
		const responseData = Buffer.concat(chunks).toString();
		res.end(responseData);
	});
}

module.exports = { handleRequest }