const { MongoClient } = require("mongodb");

const { DB_URL, USER_FOLDERS } = require("./connectionsDB");

const { getRedirectUrl } = require("./getRedirectUrl");
const { getUserInfo } = require("./getUserInfo");
const { getUser } = require("./getUser");

const handleSuccessRequest = res => response => {
	const chunks = [];

	response.on("data", (chunk) => {
		chunks.push(chunk);
	});

	response.on("end", async () => {
		const { access_token, account_id } = JSON.parse(Buffer.concat(chunks).toString());
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
		}

		res.redirect(getRedirectUrl(`access=true&email=${user.email}&name=${user.name.surname}`));
	});
};

module.exports = { handleSuccessRequest };