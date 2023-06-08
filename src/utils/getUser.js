const axios = require("axios");

const getUser = async (accessToken, account_id) => {
	try {
		const response = await axios.post(
			"https://api.dropboxapi.com/2/users/get_account",
			{
				account_id,
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

module.exports = { getUser };