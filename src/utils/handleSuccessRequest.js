const fs = require("fs").promises;
const path = require("path");

const { getRedirectUrl } = require("./getRedirectUrl");
const { checkFileAccess } = require("./checkFileAccess");
const { getUserInfo } = require("./getUserInfo");

const authPath = path.join(process.cwd(), "src", "auth");
const filePath = path.join(authPath, "user-folders.json");


const handleSuccessRequest = res => response => {
	const chunks = [];

	response.on("data", (chunk) => {
		chunks.push(chunk);
	});

	response.on("end", async () => {
		const isAuthDirExists = await checkFileAccess(authPath);

		if (!isAuthDirExists) {
			try {
				await fs.mkdir(authPath, { recursive: true });
			} catch (error) {
				console.error("Error creating the auth directory:", error);
				return;
			}
		}

		const responseData = await JSON.parse(Buffer.concat(chunks).toString());
		const response = await getUserInfo(responseData.access_token);
		await fs.writeFile(filePath, JSON.stringify(response, null, 2));
		res.redirect(getRedirectUrl("access=true"));
	});
}

module.exports = { handleSuccessRequest };