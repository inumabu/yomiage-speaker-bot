require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { processText } = require('./text/pipeline');
const { getUserSettings, getGuildDictionary } = require('./database');
const { commands } = require('./discord/commands');
const { handleInteraction } = require('./discord/interactions');
const speechQueue = require('./speech/queue');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Slash Command の自動登録
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('Registering Slash Commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
    console.log('Slash Commands registered successfully!');
  } catch (err) {
    console.error('Failed to register commands:', err);
  }
});

// Slash Command Interaction
client.on('interactionCreate', handleInteraction);

// メッセージ読み上げ
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild || message.content.startsWith('/')) return;

  const connection = getVoiceConnection(message.guild.id);
  if (!connection) return;

  try {
    const userSettings = await getUserSettings(message.guild.id, message.author.id);
    const dictionary = await getGuildDictionary(message.guild.id);

    const speakerId = userSettings?.speaker ?? 3;
    const processedText = await processText(message.content, dictionary);

    if (processedText) {
      await speechQueue.enqueue(
        message.guild.id,
        connection,
        processedText,
        speakerId,
        userSettings || {}
      );
    }
  } catch (err) {
    console.error('[Message Handling Error]', err);
  }
});

client.login(process.env.DISCORD_TOKEN);