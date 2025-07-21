import { createBullBoard } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import express, { Express } from "express";
import session from "express-session";
import passport from "passport";
import bodyParser from "body-parser";
import { ensureLoggedIn } from "connect-ensure-login";
import path from "path";
import config from "./config";
import { authRouter } from "./auth";

const bullBoardOptions = config.getBullBoardOptions();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath(config.PROXY_PATH);

if (Object.keys(bullBoardOptions).length > 0) {
	console.log(
		"Bull Board Options:",
		JSON.stringify(bullBoardOptions, null, 2)
	);
}

const { setQueues } = createBullBoard({
	queues: [],
	serverAdapter,
	options: config.getBullBoardOptions(),
});

// Set UI config if provided
if (bullBoardOptions.uiConfig) {
	serverAdapter.setUIConfig(bullBoardOptions.uiConfig);
}

const app: Express = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

if (app.get("env") !== "production") {
	const morgan = require("morgan");
	app.use(morgan("combined"));
}

app.use((req, _res, next) => {
	if (config.PROXY_PATH) {
		// @ts-ignore
		req.proxyUrl = config.PROXY_PATH;
	}
	next();
});

const sessionOpts = {
	name: "bull-board.sid",
	secret: Math.random().toString(),
	resave: false,
	saveUninitialized: false,
	cookie: {
		path: config.PROXY_PATH || "/",
		httpOnly: false,
		secure: false,
	},
};

app.use(session(sessionOpts));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));

const router = serverAdapter.getRouter();

if (config.AUTH_ENABLED) {
	app.use(config.LOGIN_PAGE, authRouter);
	app.use(config.HOME_PAGE, ensureLoggedIn(config.LOGIN_PAGE), router);
} else {
	app.use(config.HOME_PAGE, router);
}

export { app, setQueues };

