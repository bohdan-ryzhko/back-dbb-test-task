const express = require("express");
const cors = require("cors");
const { router } = require("./routes/routes");
const { ROOT, PORT } = require("./constants/paths");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ROOT, router);

app.listen(PORT, () => console.log(`Server listen on ${PORT}`));
