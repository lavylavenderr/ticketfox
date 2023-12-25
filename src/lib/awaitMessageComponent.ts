import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';

export async function awaitInteraction(filter: any, time: number, message: Message, interaction: Command.ChatInputCommandInteraction) {
	try {
		await message.awaitMessageComponent({ filter, time });
	} catch {
		await interaction.editReply({ content: 'This action has timed out due to the lack of activity.', components: [] });
	}
}
