import { Precondition, Result, UserError } from '@sapphire/framework';
import { CommandInteraction, ContextMenuCommandInteraction } from 'discord.js';
import { prisma } from '../lib/db';

export class setupComplete extends Precondition {
	public override async chatInputRun(interaction: CommandInteraction): Promise<Result<unknown, UserError>> {
		// for Slash Commands
		return this.checkIfSetup(interaction.guildId!);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction): Promise<Result<unknown, UserError>> {
		// for Context Menu Command
		return this.checkIfSetup(interaction.guildId!);
	}

	private async checkIfSetup(guildId: string) {
		try {
			const guildSettings = await prisma.server.findUnique({
				where: {
					serverId: guildId
				},
				cacheStrategy: {
					ttl: 120
				}
			});

			if (!guildSettings)
				return this.error({
					message: 'Sorry! The owner of this guild has yet to setup the bot. Please run the setup command and then try again later.'
				});

			return this.ok();
		} catch (e) {
			this.container.logger.error(e);
			return this.error({
				message: 'Sorry! Something went wrong, this error has been reported to the appropiate staff.'
			});
		}
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		setupComplete: never;
	}
}
