const handleErrorRequest = res => error => {
	console.error("Request error:", error);
	res.status(500).end("Internal Server Error");
}

module.exports = { handleErrorRequest };