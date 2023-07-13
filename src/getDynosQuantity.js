const Heroku = require('heroku-client');
const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });
const logger = require('./logger');

const getDynosQuantity = async (prototypeFromReferrer) => {
  try {
    const formationResponse = await heroku.get(`/apps/${prototypeFromReferrer}/formation`);
    return formationResponse[0]['quantity'];
  } catch (err) {
    logger.error(`Unable to get dyno count for ${prototypeFromReferrer}`, { err });
    return -1;
  };
};

module.exports = { getDynosQuantity };
