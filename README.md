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

## License

This code is open source software licensed under the [Apache 2.0 License]("http://www.apache.org/licenses/LICENSE-2.0.html").
