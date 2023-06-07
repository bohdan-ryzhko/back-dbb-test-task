const queryString = require("querystring");
const fs = require("fs").promises;
const path = require("path");

const { getRedirectUrl } = require("../utils/getRedirectUrl");

const authPath = path.join(process.cwd(), "src", "auth");
const filePath = path.join(authPath, "auth.json");

async function checkFileAccess(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch (error) {
		return false;
	}
}

const handleSuccessRequest = res => response => {
	const chunks = [];

	response.on("data", (chunk) => {
		chunks.push(chunk);
	});

	response.on("end", async () => {
		const responseData = Buffer.concat(chunks).toString();

		const isAuthDirExists = await checkFileAccess(authPath);

		if (!isAuthDirExists) {
			try {
				await fs.mkdir(authPath, { recursive: true });
				console.log("Директория auth создана");
			} catch (error) {
				console.error("Ошибка при создании директории auth:", error);
				return;
			}
		}

		const isFileExists = await checkFileAccess(filePath);

		if (!isFileExists) {
			try {
				await fs.writeFile(filePath, "");
				console.log("Файл auth.json создан");
			} catch (error) {
				console.error("Ошибка при создании файла auth.json:", error);
				return;
			}
		}

		const parsedData = JSON.parse(responseData);
		await fs.writeFile(filePath, JSON.stringify(parsedData, null, 2));

		const authorizeFile = JSON.parse(await fs.readFile(filePath, "utf-8"));
		console.log(authorizeFile);

		if (authorizeFile.access_token !== "") {
			const query = queryString.stringify({ auth: true });
			res.redirect(getRedirectUrl(query));
		} else {
			const query = queryString.stringify({ auth: false });
			res.redirect(getRedirectUrl(query));
		}

	});
}

module.exports = { handleSuccessRequest };