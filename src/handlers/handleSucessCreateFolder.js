const { MongoClient } = require("mongodb");
const { DB_URL, USER_FOLDERS } = require("../utils/connectionsDB");

const { getRedirectUrlCreateFolder } = require("../utils/getRedirectUrl");
const { createFolder } = require("../requests/createFolder");
const { getParseChunks } = require("../utils/getParseChunks");
const { getUser } = require("../requests/getUser");
const { getUserInfo } = require("../requests/getUserInfo");

const handleSucessCreateFolder = ({ res, path, email }) => (response) => {
	const chunks = [];

	response.on("data", (chunk) => {
		chunks.push(chunk);
	});

	response.on("end", async () => {
		const client = new MongoClient(DB_URL, { useUnifiedTopology: true });

		const { access_token, account_id } = getParseChunks(chunks);

		const { metadata } = await createFolder(path, access_token);

		const user = await getUser(access_token, account_id);
		const userInfo = await getUserInfo(access_token);

		try {
			await client.connect();
			const db = client.db();
			const collection = db.collection(USER_FOLDERS);

			const existingUser = await collection.findOne({ email });

			const updatedUser = { ...existingUser, ...user, ...userInfo };

			await collection.findOneAndUpdate(
				{ email },
				{ $set: updatedUser },
				{ returnOriginal: false }
			);

		} catch (error) {
			console.error("Error connecting to database:", error);
			res.status(400).json("Bad request");
		}

		return res.redirect(getRedirectUrlCreateFolder(`create=true&newFolder=${metadata.name}`));
	});
}

module.exports = { handleSucessCreateFolder };
