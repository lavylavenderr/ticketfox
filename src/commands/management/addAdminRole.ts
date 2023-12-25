import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { prisma } from '../../lib/db';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'addAdmin',
	description: "Add a role that can configure the bot's various settings.",
	preconditions: ['ownerOnly', 'setupComplete', 'onlyServerAdmins']
})
export class AdminRoleCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();

		let content: string | string[];
		const collectorFilter = (i: any) => i.author.id === interaction.user.id;

		try {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							'What role(s) would you like to allow to configure the various settings of the bot? Please send the ID(s) down below. (ex: 123, 456)  '
						)
						.setFooter({ text: "Say 'cancel' to end this interaction." })
						.setColor('Purple')
				]
			});

			const collected = await interaction.channel?.awaitMessages({ filter: collectorFilter, max: 1, time: 6000, errors: ['time'] });
			content = this.convertIntoUsable(collected?.first()?.content!);
			collected?.first()?.delete();

			// @ts-expect-error
			if (content == 'cancel')
				return interaction.editReply({
					embeds: [new EmbedBuilder().setDescription('I have sucessfully cancelled this interaction.').setColor('Purple')]
				});

			await interaction.editReply({
				embeds: [new EmbedBuilder().setDescription('Got it! Wait while I process your request...').setColor('Purple')]
			});

			const checkResult = await this.checkIfValid(interaction, content);
			if (!checkResult) {
				return interaction.editReply('Oops! One of the ID(s) supplied appears to be invalid. Please double-check the supplied ID(s).');
			}

			const existingConfig = await prisma.server.findUnique({
				where: {
					serverId: interaction.guildId!
				}
			});

			await prisma.server.update({
				where: {
					serverId: interaction.guildId!
				},
				data: {
					adminRoles: this.formatArray(existingConfig?.adminRoles, content)
				}
			});

			return interaction.editReply("I've successfully processed your request!");
		} catch (error) {
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setDescription('Sorry! No ID(s) were supplied within a certain timeframe. Please try again.')
						.setColor('Purple')
				]
			});
		}
	}

	private async checkIfValid(interaction: Command.ChatInputCommandInteraction, arrayOrString: string | string[]) {
		const rolesToCheck = Array.isArray(arrayOrString) ? arrayOrString : [arrayOrString];

		const roleExists = rolesToCheck.every((role) => {
			const guildRole = interaction.guild?.roles.cache.get(role as string);
			return guildRole !== undefined;
		});

		return roleExists;
	}

	private formatArray(existingArray: string[] | undefined, newArray: string[]) {
		if (!existingArray) return;

		const uniqueSet = new Set(existingArray);
		newArray.forEach((item) => uniqueSet.add(item));

		return Array.from(uniqueSet);
	}

	private convertIntoUsable(string: string) {
		string = string.replace(/<@&|>/g, '');
		if (string.includes(',')) return string.split(',');
		else return [`${string}`];
	}
}
