const express = require("express");
const Heroku = require("heroku-client");
const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });
const PORT = process.env.PORT || 3000;

function isHerokuAppName(name) {
  return /^[a-z][a-z0-9-]{1,28}[a-z0-9]$/.test(name);
}

express()
  .get("/", (req, res) => {
    try {
      const prototypeFromReferrer = new URL(req.get("Referrer")).host.split(
        "."
      )[0];

      if (isHerokuAppName(prototypeFromReferrer)) {
        heroku
          .patch(`/apps/${prototypeFromReferrer}/formation`, {
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
            console.log(
              `Started ${prototypeFromReferrer} if not already running`
            );
            res.send(
              "Prototype was stopped and had to be restarted, please refresh the page to view prototype."
            );
          })
          .catch((error) => {
            res
              .status(error.statusCode)
              .send(
                `Error trying to start heroku app with name "${prototypeFromReferrer}": ${error.body.message}`
              );
          });
      } else {
        console.log("Could not determine heroku app name from referrer.");
        res.status(400).send("");
      }
    } catch {
      console.log("Requested without referrer.");
      return res.status(400).send("");
    }
  })
  .listen(PORT, () => {
    console.log(`prototype-restarter listening on port ${PORT}`);
  });
