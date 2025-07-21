import dotenv from "dotenv";
import type { BoardOptions } from "@bull-board/api/dist/typings/app";

dotenv.config();

interface RedisConfig {
	host: string;
	port: number;
	password?: string;
	db: number;
	tls: boolean;
}

interface Config {
	REDIS_PORT: number;
	REDIS_HOST: string;
	REDIS_DB: string;
	REDIS_PASSWORD?: string;
	REDIS_USE_TLS: boolean;
	BULL_PREFIX: string;
	BULL_VERSION: string;
	PORT: number;
	PROXY_PATH: string;
	USER_LOGIN?: string;
	USER_PASSWORD?: string;
	AUTH_ENABLED: boolean;
	HOME_PAGE: string;
	LOGIN_PAGE: string;
	getBullBoardOptions(): BoardOptions;
}

function normalizePath(pathStr: string | undefined): string {
	return (pathStr || "").replace(/\/$/, "");
}

function parseRedisUrl(url: string | undefined): RedisConfig | null {
	if (!url) return null;

	try {
		const parsed = new URL(url);
		return {
			host: parsed.hostname,
			port: parseInt(parsed.port) || 6379,
			password: parsed.password || undefined,
			db: parsed.pathname ? parseInt(parsed.pathname.slice(1)) || 0 : 0,
			tls: parsed.protocol === "rediss:",
		};
	} catch (err) {
		console.warn("Invalid REDIS_URL provided:", (err as Error).message);
		return null;
	}
}

function parseBullBoardOptions(): BoardOptions {
	const options: BoardOptions = {};
	const prefix = "BULL_BOARD_";

	// Helper function to convert snake_case to camelCase
	function toCamelCase(str: string): string {
		return str
			.toLowerCase()
			.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
	}

	// Helper function to convert value to appropriate type
	function convertValue(value: string): any {
		if (!isNaN(Number(value)) && value.trim() !== "") {
			return Number(value);
		} else if (value.toLowerCase() === "true") {
			return true;
		} else if (value.toLowerCase() === "false") {
			return false;
		}
		return value;
	}

	// Helper function to set nested property dynamically
	function setNestedProperty(obj: any, path: string, value: any) {
		const keys = path.split("__").map((key) => toCamelCase(key));
		let current = obj;

		// Navigate to the parent object
		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			if (!current[key] || typeof current[key] !== "object") {
				current[key] = {};
			}
			current = current[key];
		}

		// Set the final property
		const lastKey = keys[keys.length - 1];
		current[lastKey] = value;
	}

	// Parse all environment variables with BULL_BOARD_ prefix
	for (const [key, value] of Object.entries(process.env)) {
		if (key.startsWith(prefix) && value !== undefined) {
			const optionKey = key.slice(prefix.length);
			setNestedProperty(options, optionKey, convertValue(value));
		}
	}

	return options;
}

const PROXY_PATH = normalizePath(process.env["PROXY_PATH"]);
const redisUrlConfig = parseRedisUrl(process.env["REDIS_URL"]);

const config: Config = {
	REDIS_PORT:
		redisUrlConfig?.port || parseInt(process.env["REDIS_PORT"] || "6379"),
	REDIS_HOST:
		redisUrlConfig?.host || process.env["REDIS_HOST"] || "localhost",
	REDIS_DB: redisUrlConfig?.db.toString() || process.env["REDIS_DB"] || "0",
	REDIS_PASSWORD: redisUrlConfig?.password || process.env["REDIS_PASSWORD"],
	REDIS_USE_TLS:
		redisUrlConfig?.tls || process.env["REDIS_USE_TLS"] === "true",
	BULL_PREFIX: process.env["BULL_PREFIX"] || "bull",
	BULL_VERSION: process.env["BULL_VERSION"] || "BULLMQ",
	PORT: parseInt(process.env["PORT"] || "3000"),
	PROXY_PATH: PROXY_PATH,
	USER_LOGIN: process.env["USER_LOGIN"],
	USER_PASSWORD: process.env["USER_PASSWORD"],

	AUTH_ENABLED: Boolean(
		process.env["USER_LOGIN"] && process.env["USER_PASSWORD"]
	),
	HOME_PAGE: PROXY_PATH || "/",
	LOGIN_PAGE: `${PROXY_PATH}/login`,
	getBullBoardOptions: parseBullBoardOptions,
};

export default config;

