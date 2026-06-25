import app from "./app.mjs";
import logger from "./logger.mjs";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	logger.info(`Listening on port ${PORT}`);
});
