import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { prisma } from '../../lib/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { awaitInteraction } from '../../lib/awaitMessageComponent';

@ApplyOptions<Command.Options>({
	name: 'setup',
	description: 'Run this command to get up and running with Ticketfox!',
	preconditions: ['ownerOnly']
})
export class setupCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const existingConfig = await prisma.server.findUnique({
			where: {
				serverId: interaction.guildId!
			},
			cacheStrategy: { ttl: 30 }
		});

		if (typeof existingConfig !== null) {
			const confirm = new ButtonBuilder().setCustomId('confirm').setLabel('Confirm').setStyle(ButtonStyle.Danger);
			const cancel = new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
			const row = new ActionRowBuilder().addComponents(cancel, confirm);
			const collectorFilter = (i: any) => i.user.id === interaction.user.id;

			const response = await interaction.editReply({
				content:
					'There is already an existing server config, running this command again will delete all panels, support role settings, and admin roles. **Are you sure you want to proceed?**',
				// @ts-expect-error
				components: [row]
			});

			return -(await awaitInteraction(collectorFilter, 60000, response, interaction));
		}

		await prisma.server.create({
			data: {
				serverId: interaction.guildId!
			}
		});

		return interaction.editReply({ content: "I've successfully created the server config! For help, and tips on getting started, run `/help`" });
	}
}
