const { MongoClient } = require("mongodb");

const { DB_URL, USER_FOLDERS } = require("../utils/connectionsDB");

const { getRedirectUrl } = require("../utils/getRedirectUrl");
const { getUserInfo } = require("../requests/getUserInfo");
const { getUser } = require("../requests/getUser");
const { getParseChunks } = require("../utils/getParseChunks");

const handleSuccessAthorization = res => response => {
	const chunks = [];

	response.on("data", (chunk) => {
		chunks.push(chunk);
	});

	response.on("end", async () => {
		const { access_token, account_id } = getParseChunks(chunks);
		const user = await getUser(access_token, account_id);
		const userInfo = await getUserInfo(access_token);

		const client = new MongoClient(DB_URL, { useUnifiedTopology: true });

		try {
			await client.connect();

			const db = client.db();
			const collection = db.collection(USER_FOLDERS);

			const existingUser = await collection.findOne({ email: user.email });

			if (existingUser) {
				await client.close();
				return res.redirect(getRedirectUrl(`access=true&email=${user.email}&name=${user.name.surname}`));
			}

			await collection.insertOne({ ...userInfo, ...user });

			await client.close();
		} catch (error) {
			console.error("Error connecting to database:", error);
			res.status(400).json("Bad request");
		}

		res.redirect(getRedirectUrl(`access=true&email=${user.email}&name=${user.name.surname}`));
	});
};

module.exports = { handleSuccessAthorization };