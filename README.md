# prototype-restarter

This can be used to automatically restart a stopped prototype when it's visited.

To use it you set the heroku error page for your prototype to the URL for this app by adding this config in heroku:

```shell
ERROR_PAGE_URL=https://prototype-restarter.herokuapp.com/
```

Given your prototype is stopped, when you visit it, then this app is loaded to display the error page, and it will look
up the prototype name from the referrer header and restart it.

After that the user is asked to refresh the page (which we can't do automatically because of restrictions on the iframe
the error page is loaded within).

## Running locally

Assuming you have the heroku cli installed, we need a [HEROKU_API_TOKEN](https://github.com/hmrc/prototype-restarter/blob/main/src/app.js#L5C48-L5C64) to make calls to Heroku API

The `npm start` script uses the dotenv library to automatically load environment variables from a `.env` file if present 

```
nvm install
heroku login
echo "HEROKU_API_TOKEN=$(heroku auth:token)" > .env
npm install
npm start
```

## Creating an API key that the prototype-restarter can use

The prototype-restarter itself runs on heroku at the moment, so you can manage the HEROKU_API_TOKEN environment variable in the settings section of the Heroku control panel.

API keys need `--scope=read,write` access so that we can read if the prototype has dynos at the moment, and if not so we can write a new running dyno to the app formation if the user clicks "restart"

Don't use `heroku auth:token`, [heroku advises only to use them for local development](https://help.heroku.com/PBGP6IDE/how-should-i-generate-an-api-key-that-allows-me-to-use-the-heroku-platform-api), instead use the following command:

```
heroku authorizations:create --description="For hmrc/prototype-restarter" --scope=read,write
```

You'll see output like the following, and the prototype-restarters' `HEROKU_API_TOKEN=` environment variable needs to be set to the value after `Token:`

> **Note**
> the keys below are examples with the same format as a heroku api key, not actual keys

```
Creating OAuth Authorization... done
Client:      <none>
ID:          f81d4fae-7dec-11d0-a765-00a0c91e6bf6
Description: For hmrc/prototype-restarter
Scope:       read,write
Token:       1d6c0810-2bd6-45f3-9890-0268422a6f14
Updated at:  Mon Jul 10 2023 13:55:45 GMT+0100 (British Summer Time) (less than a minute ago)
```

If you don't set an expiry explicitly then the authorization won't expire.

## License

This code is open source software licensed under the [Apache 2.0 License]("http://www.apache.org/licenses/LICENSE-2.0.html").
