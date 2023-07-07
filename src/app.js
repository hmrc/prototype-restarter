const logger = require('./logger');
const { getDynosQuantity } = require('./getDynosQuantity');
const express = require('express');
const app = express();
const Heroku = require('heroku-client');
const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });

function isHerokuAppName(name) {
  return /^[a-z][a-z0-9-]{1,28}[a-z0-9]$/.test(name);
}

function parsePrototypeFromReferrer(referrer) {
  try {
    const prototypeFromReferrer = new URL(referrer).host.split('.')[0];

    if (isHerokuAppName(prototypeFromReferrer)) {
      logger.info('Parsed prototype name from referrer successfully', {
        referrer,
        prototypeFromReferrer,
      });

      return prototypeFromReferrer;
    } else {
      logger.error(
        "First subdomain from referrer doesn't contain a valid heroku app name",
        { referrer, prototypeFromReferrer }
      );
    }
  } catch (err) {
    logger.error("Unable to parse prototype from referrer", { err });
  }

  return "";
}

function restartButton(prototypeFromReferrer) {
  return prototypeFromReferrer &&
    `
    <form method="post" action="/${encodeURI(prototypeFromReferrer)}">
      <button class="govuk-button govuk-!-margin-top-3" data-module="govuk-button">
        Restart prototype
      </button>
    </form>
  `
}

function generateBodyContent(dynosCount, prototypeFromReferrer) {
  if (dynosCount == -1) {
    return `
    <h1 class="govuk-heading-l govuk-!-margin-top-9">This prototype is not deployed</h1>
    <p class="govuk-body">This name does not match a prototype currently deployed to Heroku.</p>
    <p class="govuk-body">It may have been undeployed to conserve resources.</p>
    <p class="govuk-body">Please also check this that is the correct prototype name.</p>
    `
  } else if(dynosCount == 0) {
    return `
    <h1 class="govuk-heading-l govuk-!-margin-top-9">This prototype is currently turned off</h1>
    <p class="govuk-body">This prototype is deployed to Heroku but is turned off.</p>
    <p class="govuk-body">It may have been turned off to conserve resources.</p>
    ${restartButton(prototypeFromReferrer)}
    `
  } else {
    return `
    <h1 class="govuk-heading-l govuk-!-margin-top-9">This prototype has errors</h1>
    <p class="govuk-body">This prototype is turned on but it failed to start up due to an error, please check the last change you deployed.</p>
    `
  }
}

function respondWithHtmlWrappedInGovukLayout(res, status, body) {
  res.status(status).setHeader("Content-Type", "text/html").send(`
      <link rel="stylesheet" href="https://www.tax.service.gov.uk/assets/hmrc-frontend/5.28.0/hmrc-frontend-5.28.0.min.css">
      <div class="govuk-width-container">${body}</div>
    `);
}

app
  .get("/", async (req, res) => {
    const prototypeFromReferrer = parsePrototypeFromReferrer(
      req.get("Referrer")
    );

    const dynosQuantity = await getDynosQuantity(
      prototypeFromReferrer
    );

    const content = generateBodyContent(
      dynosQuantity,
      prototypeFromReferrer
    )

    respondWithHtmlWrappedInGovukLayout(
      res,
      200,
      `
      ${content}
      <p class="govuk-body">If you're still having issues, you can ask for help in the #community-prototype channel in the HMRC Digital slack.</p>
    `
    );
  })
  .post("/:prototype", ({ params: { prototype } }, res) => {
    if (isHerokuAppName(prototype)) {
      heroku
        .patch(`/apps/${prototype}/formation`, {
          body: {
            updates: [
              {
                quantity: 1,
                size: "standard-1X",
                type: "web",
              },
            ],
          },
        })
        .then(() => {
          logger.info("Starting prototype if not already running", {
            prototype,
          });
          respondWithHtmlWrappedInGovukLayout(
            res,
            200,
            `
              <h1 class="govuk-heading-l govuk-!-margin-top-9">Prototype has been restarted</h1>
              <p class="govuk-body-l">Please refresh the page to try opening the prototype again.</p>
              <p class="govuk-body">If the prototype is still unavailable after refreshing, that may indicate there is an error within the prototype preventing it from starting.<p>
              <p class="govuk-body">If you're the maintainer, try running it locally to check for problems.</p>
              <p class="govuk-body">You can ask for help in the #community-prototype channel in the HMRC Digital slack.</p>
            `
          );
        })
        .catch((err) => {
          logger.error("Error trying to start heroku app", { prototype, err });
          respondWithHtmlWrappedInGovukLayout(
            res,
            err.statusCode,
            `
              <h1 class="govuk-heading-l govuk-!-margin-top-9">We weren't able to restart the prototype</h1>
              <p class="govuk-body">This might indicate there is a temporary technical issue with Heroku.</p>
              <p class="govuk-body">You can ask for help in #community-prototype channel in the HMRC Digital slack.</p>
            `
          );
        });
    } else {
      logger.error(
        "Someone tried to restart a prototype with an invalid name. This might indicate an attempt at something nefarious.",
        { prototype }
      );
      res.status(400).send("");
    }
  });

module.exports = app;