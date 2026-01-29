import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES Module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Discord client
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Initialize commands collection
client.commands = new Collection();

// Load commands
const loadCommands = async () => {
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = await import(`file://${filePath}`);

        if (command.default?.data && command.default?.execute) {
            client.commands.set(command.default.data.name, command.default);
            console.log(`📦 Loaded command: ${command.default.data.name}`);
        } else {
            console.warn(`⚠️ Command ${file} is missing required "data" or "execute" property`);
        }
    }
};

// Event: Bot ready
client.once('ready', () => {
    console.log(`✅ Bot online sebagai ${client.user.tag}`);
    console.log(`🔗 Invite URL: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=0&scope=bot%20applications.commands`);
});

// Event: Interaction create
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ Error executing command ${interaction.commandName}:`, error);

        const errorMessage = { content: '❌ Terjadi error saat menjalankan command!', ephemeral: true };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Start bot
const start = async () => {
    try {
        console.log('🔄 Loading commands...');
        await loadCommands();

        console.log('🔄 Connecting to Discord...');
        await client.login(process.env.TOKEN);
    } catch (error) {
        console.error('❌ Failed to start bot:', error);
        process.exit(1);
    }
};

start();
