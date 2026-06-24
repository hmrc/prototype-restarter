import Heroku from "heroku-client";

const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });

import logger from "./logger.mjs";

export async function getDynosQuantity(prototypeFromReferrer) {
	try {
		const formationResponse = await heroku.get(
			`/apps/${prototypeFromReferrer}/formation`,
		);
		return formationResponse[0].quantity;
	} catch (err) {
		logger.error(`Unable to get dyno count for ${prototypeFromReferrer}`, {
			err,
		});
		return -1;
	}
}
