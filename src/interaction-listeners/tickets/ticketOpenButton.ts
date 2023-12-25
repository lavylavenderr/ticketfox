import { InteractionHandler, InteractionHandlerTypes, Option } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';

export class ticketOpenHandler extends InteractionHandler {
	public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Button
		});
	}

	public override async parse(interaction: ButtonInteraction): Promise<Option.Some<string> | Option.None> {
		if (interaction.customId.startsWith('open-')) return this.some(interaction.customId.slice(5));
		else return this.none();
	}

	public async run(interaction: ButtonInteraction, categoryId: string) {
		await interaction.reply(categoryId);
	}
}
