import { createClient, RedisClientType } from "redis";
import config from "./config";

const redisConfig = {
	url: `redis${config.REDIS_USE_TLS ? "s" : ""}://${config.REDIS_HOST}:${
		config.REDIS_PORT
	}/${config.REDIS_DB}`,
	...(config.REDIS_PASSWORD && { password: config.REDIS_PASSWORD }),
};

const redisClient: RedisClientType = createClient(redisConfig);

redisClient.on("error", (err) => {
	console.error("Redis Client Error", err);
});

export default redisClient;

