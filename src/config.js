require('dotenv').config();

function normalizePath(pathStr) {
	return (pathStr || '').replace(/\/$/, '');
}

function parseRedisUrl(url) {
	if (!url) return null;

	try {
		const parsed = new URL(url);
		return {
			host: parsed.hostname,
			port: parseInt(parsed.port) || 6379,
			password: parsed.password || undefined,
			db: parsed.pathname ? parseInt(parsed.pathname.slice(1)) || 0 : 0,
			tls: parsed.protocol === 'rediss:'
		};
	} catch (err) {
		console.warn('Invalid REDIS_URL provided:', err.message);
		return null;
	}
}

const PROXY_PATH = normalizePath(process.env.PROXY_PATH);
const redisUrlConfig = parseRedisUrl(process.env.REDIS_URL);

const config = {
	REDIS_PORT: redisUrlConfig?.port || process.env.REDIS_PORT || 6379,
	REDIS_HOST: redisUrlConfig?.host || process.env.REDIS_HOST || 'localhost',
	REDIS_DB: redisUrlConfig?.db || process.env.REDIS_DB || '0',
	REDIS_PASSWORD: redisUrlConfig?.password || process.env.REDIS_PASSWORD,
	REDIS_USE_TLS: redisUrlConfig?.tls || process.env.REDIS_USE_TLS,
	BULL_PREFIX: process.env.BULL_PREFIX || 'bull',
	BULL_VERSION: process.env.BULL_VERSION || 'BULLMQ',
	PORT: process.env.PORT || 3000,
	PROXY_PATH: PROXY_PATH,
	USER_LOGIN: process.env.USER_LOGIN,
	USER_PASSWORD: process.env.USER_PASSWORD,

	AUTH_ENABLED: Boolean(process.env.USER_LOGIN && process.env.USER_PASSWORD),
	HOME_PAGE: PROXY_PATH || '/',
	LOGIN_PAGE: `${PROXY_PATH}/login`,
};

module.exports = config;
