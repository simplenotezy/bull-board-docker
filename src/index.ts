import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import Queue from "bull";
import { Queue as BullMQQueue } from "bullmq";
import express, { Request, Response, NextFunction } from "express";
import { createClient } from "redis";
import session from "express-session";
import passport from "passport";

import { authRouter } from "./login";
import config from "./config";

// Use require for untyped modules
const { ensureLoggedIn } = require("connect-ensure-login");
const bodyParser = require("body-parser");

interface RedisConfig {
	redis: {
		port: number;
		host: string;
		db: number;
		password?: string;
		tls: boolean;
	};
}

interface BullRedisConfig {
	redis: {
		port: number;
		host: string;
		db: number;
		password?: string;
		tls?: any;
	};
}

interface ExtendedRequest extends Request {
	proxyUrl?: string;
}

const redisConfig: RedisConfig = {
	redis: {
		port: config.REDIS_PORT,
		host: config.REDIS_HOST,
		db: parseInt(config.REDIS_DB),
		...(config.REDIS_PASSWORD && { password: config.REDIS_PASSWORD }),
		tls: config.REDIS_USE_TLS,
	},
};

const serverAdapter = new ExpressAdapter();
const client = createClient(redisConfig.redis);
const { setQueues } = createBullBoard({ queues: [], serverAdapter });
const router = serverAdapter.getRouter();

// Connect to Redis and fetch keys
async function initializeQueues() {
	try {
		await client.connect();
		const keys = await client.keys(`${config.BULL_PREFIX}:*`);

		const uniqKeys = new Set(
			keys.map((key) => key.replace(/^.+?:(.+?):.+?$/, "$1"))
		);
		const queueList = Array.from(uniqKeys)
			.sort()
			.map((item: string) => {
				if (config.BULL_VERSION === "BULLMQ") {
					const connectionOptions: any = {
						port: redisConfig.redis.port,
						host: redisConfig.redis.host,
						db: redisConfig.redis.db,
					};

					if (redisConfig.redis.password) {
						connectionOptions.password = redisConfig.redis.password;
					}

					if (redisConfig.redis.tls) {
						connectionOptions.tls = {};
					}

					const options: any = {
						connection: connectionOptions,
					};

					if (config.BULL_PREFIX) {
						options.prefix = config.BULL_PREFIX;
					}

					return new BullMQAdapter(new BullMQQueue(item, options));
				}

				// Bull 4.x requires different Redis config format
				const bullRedisConfig: BullRedisConfig = {
					redis: {
						port: redisConfig.redis.port,
						host: redisConfig.redis.host,
						db: redisConfig.redis.db,
						...(redisConfig.redis.password && {
							password: redisConfig.redis.password,
						}),
						...(redisConfig.redis.tls && { tls: {} }),
					},
				};
				return new BullAdapter(new Queue(item, bullRedisConfig));
			});

		setQueues(queueList);
		console.log("done!");
	} catch (err) {
		console.error("Error fetching Redis keys:", err);
	}
}

// Initialize queues
initializeQueues();

const app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

if (app.get("env") !== "production") {
	const morgan = require("morgan");
	app.use(morgan("combined"));
}

app.use((req: ExtendedRequest, _res: Response, next: NextFunction) => {
	if (config.PROXY_PATH) {
		req.proxyUrl = config.PROXY_PATH;
	}

	next();
});

const sessionOpts: session.SessionOptions = {
	name: "bull-board.sid",
	secret: Math.random().toString(),
	resave: false,
	saveUninitialized: false,
	cookie: {
		path: "/",
		httpOnly: false,
		secure: false,
	},
};

app.use(session(sessionOpts));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));

if (config.AUTH_ENABLED) {
	app.use(config.LOGIN_PAGE, authRouter);
	app.use(config.HOME_PAGE, ensureLoggedIn(config.LOGIN_PAGE), router);
} else {
	app.use(config.HOME_PAGE, router);
}

app.listen(config.PORT, () => {
	console.log(
		`bull-board is started http://localhost:${config.PORT}${config.HOME_PAGE}`
	);
	console.log(`bull-board is fetching queue list, please wait...`);
});

