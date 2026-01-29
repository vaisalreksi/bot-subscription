import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES Module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const deployCommands = async () => {
    const commands = [];
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    // Load all commands
    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = await import(`file://${filePath}`);

        if (command.default?.data) {
            commands.push(command.default.data.toJSON());
            console.log(`📦 Loaded: ${command.default.data.name}`);
        }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log(`\n⏳ Deploying ${commands.length} command(s)...`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(`✅ Successfully registered ${data.length} slash command(s)!`);
    } catch (error) {
        console.error('❌ Failed to deploy commands:', error);
        process.exit(1);
    }
};

deployCommands();
