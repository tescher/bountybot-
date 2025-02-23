// Require the necessary discord.js classes
import { Client, Intents } from 'discord.js';
import { SlashCreator, GatewayServer, SlashCommand, CommandContext } from 'slash-create';
import path from 'path';
import fs from 'fs';
import Log from './utils/Log';

new Log();

// Create a new client instance
const client = new Client({
	// https://discordjs.guide/popular-topics/intents.html
	// https://discord.com/developers/docs/topics/gateway#privileged-intents
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		Intents.FLAGS.GUILD_WEBHOOKS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,

	],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

const eventFiles = fs.readdirSync(path.join(__dirname, '/events')).filter(file => file.endsWith('.js'));
eventFiles.forEach(file => {
	const event = new (require(`./events/${file}`).default)();
	try {
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args, client));
		} else {
			client.on(event.name, (...args) => event.execute(...args, client));
		}
	} catch (e) {
		Log.error('Event failed to process', {
			indexMeta: true,
			meta: {
				name: e.name,
				message: e.message,
				stack: e.stack,
				event,
			},
		});
	}
});

const creator = new SlashCreator({
	applicationID: process.env.DISCORD_BOT_APPLICATION_ID,
	publicKey: process.env.DISCORD_BOT_PUBLIC_KEY,
	token: process.env.DISCORD_BOT_TOKEN,
});

creator
	.withServer(
		new GatewayServer(
			(handler) => client.ws.on('INTERACTION_CREATE', handler)
		)
	)
	.registerCommandsIn(path.join(__dirname, 'commands/bounty'))
	.syncCommands();

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);

export default client;