const axios = require("axios");

const createFolder = async (path, accessToken) => {
	try {
		const response = await axios.post(
			"https://api.dropboxapi.com/2/files/create_folder_v2",
			{
				autorename: false,
				path,
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json"
				}
			}
		);

		return response.data;
	} catch (error) {
		console.error("Failed to get user information:", error);
		throw error;
	}
}

module.exports = { createFolder };
