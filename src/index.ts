import { app, setQueues } from "./app";
import { setupQueues } from "./queues";
import config from "./config";

async function main() {
	await setupQueues(setQueues);

	app.listen(config.PORT, () => {
		console.log(
			`bull-board is started http://localhost:${config.PORT}${config.HOME_PAGE}`
		);
		console.log(`bull-board is fetching queue list, please wait...`);
	});
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

