import { BullAdapter } from "@bull-board/api/bullAdapter";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { BaseAdapter } from "@bull-board/api/dist/src/queueAdapters/base";
import Queue from "bull";
import { Queue as BullMQQueue } from "bullmq";
import config from "./config";
import redisClient from "./redis";

const bullRedisConfig = {
	redis: {
		port: config.REDIS_PORT,
		host: config.REDIS_HOST,
		db: parseInt(config.REDIS_DB),
		...(config.REDIS_PASSWORD && { password: config.REDIS_PASSWORD }),
		...(config.REDIS_USE_TLS && { tls: {} }),
	},
};

const bullmqConnectionOptions = {
	port: config.REDIS_PORT,
	host: config.REDIS_HOST,
	db: parseInt(config.REDIS_DB),
	...(config.REDIS_PASSWORD && { password: config.REDIS_PASSWORD }),
	...(config.REDIS_USE_TLS && { tls: {} }),
};

function createQueue(name: string): BaseAdapter {
	if (config.BULL_VERSION === "BULLMQ") {
		const queueOptions = {
			connection: bullmqConnectionOptions,
			...(config.BULL_PREFIX && { prefix: config.BULL_PREFIX }),
		};
		return new BullMQAdapter(new BullMQQueue(name, queueOptions));
	} else {
		return new BullAdapter(new Queue(name, bullRedisConfig));
	}
}

export async function setupQueues(
	setQueues: (queues: BaseAdapter[]) => void
): Promise<void> {
	try {
		console.log("Connecting to Redis");
		if (!redisClient.isOpen) {
			await redisClient.connect();
		}
		console.log("Connected to Redis");

		console.log("Fetching Redis keys");
		const keys = await redisClient.keys(`${config.BULL_PREFIX}:*`);
		const uniqueKeys = new Set(
			keys.map((key) => key.replace(/^.+?:(.+?):.+?$/, "$1"))
		);

		const queues = Array.from(uniqueKeys).sort().map(createQueue);
		setQueues(queues);
		console.log("Setup queues done!");
	} catch (err) {
		console.error("Error fetching Redis keys:", err);
	}
}

// Export function to get Redis client for graceful shutdown
export function getRedisClient() {
	return redisClient;
}

