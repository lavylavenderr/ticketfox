import './lib/setup';
import './lib/setup';
import { TicketClient } from './lib/client';

const client = new TicketClient();

(async () => {
	try {
		await client.login();
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
})()
