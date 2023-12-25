import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';

// default sapphire command, just gonna keep it here :)
@ApplyOptions<Command.Options>({
	description: 'ping pong'
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.sendPing(interaction);
	}

	private async sendPing(interactionOrMessage: Command.ChatInputCommandInteraction) {
		const pingMessage = await interactionOrMessage.reply({ content: 'Ping?', fetchReply: true });

		const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
			pingMessage.createdTimestamp - interactionOrMessage.createdTimestamp
		}ms.`;

		if (interactionOrMessage instanceof Message) {
			return pingMessage.edit({ content });
		}

		return interactionOrMessage.editReply({
			content: content
		});

		

		// let funny: string;
		// const collectorFilter = (i: any) => i.author.id === interactionOrMessage.user.id;
		// await interactionOrMessage.reply('Weee!');
		// const collector = interactionOrMessage.channel?.createMessageCollector({ filter: collectorFilter, time: 5000 })!;

		// collector.on('collect', async (m) => {
		// 	funny = m.content;
		// 	await m.delete();
		// });

		// collector.on('end', () => {
		// 	console.log(funny);
		// });
	}
}
