import { CommandInteraction } from 'discord.js';
import { Precondition, Result, UserError } from '@sapphire/framework';

export class ownerOnly extends Precondition {
	public override async chatInputRun(interaction: CommandInteraction): Promise<Result<unknown, UserError>> {
		return this.checkIfServerOwner(interaction.guild?.ownerId!, interaction.user.id);
	}

	private async checkIfServerOwner(ownerId: string, userId: string) {
		if (ownerId !== userId) return this.error({ message: 'Only the owner can run this command.' });
		else return this.ok();
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		ownerOnly: never;
	}
}
