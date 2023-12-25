import { Precondition, Result, UserError } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';
import { prisma } from '../lib/db';

export class onlyServerAdmins extends Precondition {
	public override async chatInputRun(interaction: CommandInteraction): Promise<Result<unknown, UserError>> {
		const guildMember = interaction.guild?.members.cache.get(interaction.user.id);
		const serverConfig = await prisma.server.findUnique({
			where: {
				serverId: interaction.guildId!
			}
		});

		const hasRequiredRole = serverConfig?.adminRoles.some((role) => {
			return guildMember?.roles.cache.has(role);
		});

		if (!hasRequiredRole) {
			return this.error({ message: "Sorry! You don't have the roles required to run this command." });
		}

		return this.ok();
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		onlyServerAdmins: never;
	}
}
