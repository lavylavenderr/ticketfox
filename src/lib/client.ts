import { LogLevel, SapphireClient } from '@sapphire/framework';
import { join } from 'path';
import { prisma } from './db';
import { getRootData } from '@sapphire/pieces';
import { GatewayIntentBits } from 'discord.js';
import '@sapphire/plugin-api/register';

export class TicketClient extends SapphireClient {
	private rootData = getRootData();

	public constructor() {
		super({
			intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
			shards: 'auto',
			logger: {
				level: LogLevel.Debug
			},
			api: {
				automaticallyConnect: true,
				prefix: 'api/',
				origin: '*',
				listenOptions: {
					port: 30001
				}
			}
		});

		this.stores.get('listeners').registerPath(join(this.rootData.root, 'listeners'));
	}

	public override async login() {
		return super.login();
	}

	public override async destroy() {
		await prisma.$disconnect();
		return super.destroy();
	}
}
