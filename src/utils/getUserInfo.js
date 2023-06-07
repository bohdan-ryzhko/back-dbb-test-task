const axios = require("axios");

const getUserInfo = async (accessToken) => {
	try {
		const response = await axios.post(
			"https://api.dropboxapi.com/2/files/list_folder",
			{
				path: "",
				recursive: false,
				include_media_info: false,
				include_deleted: false,
				include_has_explicit_shared_members: false,
				include_mounted_folders: true
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

module.exports = { getUserInfo };