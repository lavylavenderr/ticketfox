import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChannelType, EmbedBuilder } from 'discord.js';
import { prisma } from '../../lib/db';

@ApplyOptions<Command.Options>({
	name: 'addCategory',
	description: 'Use this command to add a support category!',
	preconditions: ['setupComplete', 'ownerOnly', 'onlyServerAdmins']
})
export class addCategoryCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();

		let categoryId: string;
		let categoryName: string;
		let categoryRoles: string[];
		const collectorFilter = (i: any) => i.author.id === interaction.user.id;

		try {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setDescription('What is the ID of the category you would like to setup? Think the of ID of server channel categories.')
						.setColor('Purple')
				]
			});

			const collected1 = await interaction.channel?.awaitMessages({ filter: collectorFilter, max: 1, time: 6000, errors: ['time'] });
			categoryId = collected1?.first()!.content!;
			collected1?.first()!.delete();

			const doesCategoryExist = await interaction.guild?.channels.cache.find(
				(channel) => channel.type == ChannelType.GuildCategory && channel.id == categoryId
			);

			if (!doesCategoryExist)
				return interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription('Oops! That does not appear to be a valid category ID. Please double check and try again!')
							.setColor('Purple')
					]
				});

			await interaction.editReply({
				embeds: [new EmbedBuilder().setDescription('What would you like to name this category? Keep it short and simple!').setColor('Purple')]
			});

			const collected2 = await interaction.channel?.awaitMessages({ filter: collectorFilter, max: 1, time: 6000, errors: ['time'] });
			categoryName = collected2?.first()!.content!;
			collected2?.first()!.delete();

			await interaction.editReply({
				embeds: [new EmbedBuilder().setDescription('What role(s) would you like to like to grant ticket access to?').setColor('Purple')]
			});

			const collected3 = await interaction.channel?.awaitMessages({ filter: collectorFilter, max: 1, time: 6000, errors: ['time'] });
			categoryRoles = this.convertIntoUsable(collected3?.first()?.content!);
			collected3?.first()!.delete();

			await interaction.editReply({
				embeds: [new EmbedBuilder().setDescription('Got it! Wait while I process your request...').setColor('Purple')]
			});

			const checkResult = await this.checkIfValid(interaction, categoryRoles);
			if (!checkResult)
				return interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription('Oops! One of the ID(s) supplied appears to be invalid. Please double-check the supplied ID(s).')
							.setColor('Purple')
					]
				});

			await prisma.category.create({
				data: {
					serverId: interaction.guildId!,
					categoryName,
					categoryId,
					supportRoles: categoryRoles
				}
			});

			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							`I have successfully created a new category with the name: **${categoryName}**. In order to apply these changes to any existing panel, please rerun the panel command.`
						)
						.setColor('Purple')
				]
			});
		} catch {
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setDescription('Sorry! No response was supplied within the specified timeframe. Please try again.')
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

	private convertIntoUsable(string: string) {
		string = string.replace(/<@&|>/g, '');
		if (string.includes(',')) return string.split(',');
		else return [`${string}`];
	}
}
