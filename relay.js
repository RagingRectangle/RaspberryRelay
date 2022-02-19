const {
	Client,
	Intents,
	MessageEmbed,
	Permissions,
	MessageActionRow,
	MessageSelectMenu,
	MessageButton
} = require('discord.js');
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
const Gpio = require('onoff').Gpio;
const config = require('./config/config.json');
const devices = require('./config/devices.json');

client.on('ready', async () => {
	console.log("RaspberryRelay Bot Logged In");
});

//Check for device
client.on('messageCreate', async (receivedMessage) => {
	if (!config.admins.includes(receivedMessage.author.id) && receivedMessage.author.bot === false) {
		return;
	}
	let username = receivedMessage.author.username;
	let message = receivedMessage.content.toLowerCase();
	if (message.startsWith(config.prefix) && config.admins.includes(receivedMessage.author.id) && config.commandChannels.includes(receivedMessage.channel.id) && receivedMessage.author.bot === false) {
		let possibleOrigin = message.replace(config.prefix, '');
		checkForDevice(receivedMessage.channel, username, possibleOrigin);
	}
	//NoProto Auto Cycle
	if (client.user === receivedMessage.author && config.noProtoAutoCycle === true && config.noProtoChannels.includes(receivedMessage.channel.id) && receivedMessage.content.includes('No Proto Devices:')) {
		let components = receivedMessage.components;
		var noProtoDevices = [];
		for (var c = 0; c < components.length; c++) {
			rowButtons = components[c]['components'];
			rowButtons.forEach(button => {
				if (button.style === 'DANGER') {
					let label = button.label.split(' ');
					let device = label.slice(0, -1).join(' ');
					noProtoDevices.push(device);
				}
			});
		} //End of c loop
		noProtoDevices.forEach(async origin => {
			checkForDevice(receivedMessage.channel, 'noProto', origin);
			await new Promise(done => setTimeout(done, 2000));
		});
	} //End of noProto
}); //End of client.on(message)

client.on('interactionCreate', async interaction => {
	let user = await interaction.member;
	if (!config.admins.includes(user.id)) {
		return;
	}
	let username = user.user.username;
	var channelType = "GUILD_TEXT";
	if (interaction.message.guildId === null) {
		channelType = "DM";
	}
	if (user.bot == true) {
		return;
	}
	interaction.message.edit({
		components: interaction.message.components
	});
	//Verify interaction
	if (interaction.customId.endsWith('~deviceControl')) {
		let possibleOrigin = interaction.values[0].replace('raspberryRelay~', '');
		checkForDevice(interaction.message.channel, username, possibleOrigin);
	}
}); //End of client.on(interactionCreate)

async function checkForDevice(channel, username, possibleOrigin) {
	for (var d = 0; d < devices.length; d++) {
		if (devices[d]['device'].toLowerCase() === possibleOrigin.toLowerCase()) {
			toggleRelay(channel, username, devices[d]['device'], devices[d]['gpio']);
			break;
		}
	}
} //End of checkForDevice()

async function toggleRelay(channel, username, device, gpio) {
	let relayMode = config.relayMode.toLowerCase();
	let timer = Math.max(config.toggleTimeSeconds, 2);
	var deviceOn, deviceOff
	if (relayMode === 'no') {
		deviceOn = 1;
		deviceOff = 0;
	} else if (relayMode === 'nc') {
		deviceOn = 0;
		deviceOff = 1;
	} else {
		console.log("reloadMode not set correctly in config.json!");
		return;
	}
	var check1, check2;
	try {
		let piPin = new Gpio(gpio, 'out');
		piPin.writeSync(deviceOff);
		check1 = piPin.readSync();
		await new Promise(done => setTimeout(done, (timer * 1000)));
		try {
			piPin.writeSync(deviceOn);
			check2 = piPin.readSync();
			if (check1 !== check2) {
				console.log(`${username} power cycled ${device}`);
				channel.send(`${username} power cycled ${device}`).catch(console.error)
					.then(msg => {
						if (config.deleteResultsSeconds > 0) {
							setTimeout(() => msg.delete().catch(err => console.log(`(${username}) Error deleting power cycle message:`, err)), (config.deleteResultsSeconds * 1000));
						}
					});
			}
		} catch (err) {
			console.log(`${username} failed to power ${device} back on: ${err}`);
			channel.send(`${username} failed to power ${device} back on`).catch(console.error)
			.then(msg => {
				if (config.deleteResultsSeconds > 0) {
					setTimeout(() => msg.delete().catch(err => console.log(`(${username}) Error deleting power cycle message:`, err)), (config.deleteResultsSeconds * 1000));
				}
			});
		}
	} catch (err) {
		console.log(`${username} failed to power ${device} off: ${err}`);
		channel.send(`${username} failed to power ${device} off`).catch(console.error)
		.then(msg => {
			if (config.deleteResultsSeconds > 0) {
				setTimeout(() => msg.delete().catch(err => console.log(`(${username}) Error deleting power cycle message:`, err)), (config.deleteResultsSeconds * 1000));
			}
		});
	}
} //End of toggleRelay()

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.login(config.botToken);