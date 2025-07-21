import { app, setQueues } from "./app";
import { setupQueues } from "./queues";
import config from "./config";

async function main() {
	await setupQueues(setQueues);

	const server = app.listen(config.PORT, () => {
		console.log(
			`bull-board is started http://localhost:${config.PORT}${config.HOME_PAGE}`
		);
	});

	// Graceful shutdown handling
	const gracefulShutdown = async (signal: string) => {
		console.log(`Received ${signal}. Starting graceful shutdown...`);

		let shutdownComplete = false;

		const completeShutdown = () => {
			if (!shutdownComplete) {
				shutdownComplete = true;
				console.log("Graceful shutdown completed");
				process.exit(0);
			}
		};

		try {
			// Close HTTP server first
			server.close(() => {
				console.log("HTTP server closed");
			});

			// Close Redis connections if they exist
			try {
				const { getRedisClient } = await import("./queues");
				const redisClient = getRedisClient();
				if (redisClient && redisClient.isOpen) {
					await redisClient.quit();
					console.log("Redis connections closed");
				}
			} catch (error) {
				console.log("Redis shutdown error:", error);
			}

			// Remove all event listeners to prevent memory leaks
			process.removeAllListeners("SIGTERM");
			process.removeAllListeners("SIGINT");
			process.removeAllListeners("SIGUSR2");

			// Complete shutdown after a short delay to ensure all cleanup is done
			setTimeout(completeShutdown, 100);
		} catch (error) {
			console.error("Error during shutdown:", error);
			completeShutdown();
		}

		// Force exit after 3 seconds if graceful shutdown fails
		setTimeout(() => {
			if (!shutdownComplete) {
				console.error("Forced shutdown after timeout");
				process.exit(1);
			}
		}, 3000);
	};

	// Handle shutdown signals
	process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
	process.on("SIGINT", () => gracefulShutdown("SIGINT"));

	// Handle nodemon restart signal
	process.on("SIGUSR2", () => {
		console.log(
			"Received SIGUSR2 (nodemon restart). Starting graceful shutdown..."
		);
		gracefulShutdown("SIGUSR2");
	});
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

