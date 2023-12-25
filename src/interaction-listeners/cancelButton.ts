import { InteractionHandler, InteractionHandlerTypes, Option } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';

export class cancelButton extends InteractionHandler {
	public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Button
		});
	}

	public override async parse(interaction: ButtonInteraction): Promise<Option.Some<null> | Option.None> {
		if (interaction.customId === 'cancel') return this.some();
		else return this.none();
	}

	public async run(interaction: ButtonInteraction) {
		return interaction.reply({ content: 'This action has successfully been cancelled.', ephemeral: true });
	}
}
