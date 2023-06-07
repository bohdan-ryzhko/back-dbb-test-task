const checkFileAccess = async (filePath) => {
	try {
		await fs.access(filePath);
		return true;
	} catch (error) {
		return false;
	}
}

module.exports = { checkFileAccess };