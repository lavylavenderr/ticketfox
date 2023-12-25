import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	name: 'createpanel',
	description: 'Create the ticket panel with buttons for each of your corresponding categories!',
    preconditions: ['setupComplete']
})
export class createPanelCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addChannelOption((option) => option.setName('channel').setDescription("Where you'd like to send the panel embed to").setRequired(true))
		);
	};

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        return interaction.reply("Weee")
    }
}
