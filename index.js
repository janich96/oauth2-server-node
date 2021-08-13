// Импорт базы данных
const pgPool = require("./db/pgWrapper");
const tokenDB = require("./db/tokenDB")(pgPool);
const userDB = require("./db/userDB")(pgPool);

// Импорт oauth2.0
const oAuthService = require("./auth/tokenService")(userDB, tokenDB);
const oAuth2Server = require("node-oauth2-server");

// Express
const express = require("express");
const app = express();
app.oauth = oAuth2Server({
	model: oAuthService,
	grants: ["password"],
	debug: true,
});

// Тесты
const testAPIService = require("./test/testAPIService.js");
const testAPIRoutes = require("./test/testAPIRoutes.js")(
	express.Router(),
	app,
	testAPIService
);

// Авторизация и роутер
const authenticator = require("./auth/authenticator")(userDB);
const routes = require("./auth/routes")(
	express.Router(),
	app,
	authenticator
);
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(app.oauth.errorHandler());
app.use("/auth", routes);
app.use("/test", testAPIRoutes);

const port = 8000;
app.listen(port, () => {
	console.log(`listening on port ${port}`);
});