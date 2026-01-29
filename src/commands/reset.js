import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import googleSheetsService from '../services/googleSheets.js';

// Configuration for each subscription type
const CONFIG = {
    google: {
        name: 'Google Workspace',
        emoji: '☁️',
        color: 0xFF6B6B,
        sheet: 'Google'
    },
    vps: {
        name: 'VPS',
        emoji: '🖥️',
        color: 0xFF6B6B,
        sheet: 'VPS'
    },
    domain: {
        name: 'Domain',
        emoji: '🌐',
        color: 0xFF6B6B,
        sheet: 'Domain'
    }
};

export default {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset subscription data (requires password)')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of subscription to reset')
                .setRequired(true)
                .addChoices(
                    { name: '☁️ Google Workspace', value: 'google' },
                    { name: '🖥️ VPS', value: 'vps' },
                    { name: '🌐 Domain', value: 'domain' }
                )
        )
        .addStringOption(option =>
            option
                .setName('password')
                .setDescription('Admin password')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); // Make response private

        const type = interaction.options.getString('type');
        const password = interaction.options.getString('password');
        const username = interaction.user.username;
        const config = CONFIG[type];

        // Verify password
        const correctPassword = process.env.RESET_PASSWORD;
        if (!correctPassword) {
            await interaction.editReply({
                content: '❌ RESET_PASSWORD is not configured in environment variables.'
            });
            return;
        }

        if (password !== correctPassword) {
            await interaction.editReply({
                content: '❌ Incorrect password. Access denied.'
            });
            return;
        }

        try {
            // Clear B3:C14, E3:E14, and G3:G14
            await googleSheetsService.clearRange(
                process.env.GOOGLE_SHEET_ID,
                `${config.sheet}!B3:C14`
            );
            await googleSheetsService.clearRange(
                process.env.GOOGLE_SHEET_ID,
                `${config.sheet}!E3:E14`
            );
            await googleSheetsService.clearRange(
                process.env.GOOGLE_SHEET_ID,
                `${config.sheet}!G3:G14`
            );

            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('🗑️ Data Reset Complete')
                .setDescription(`${config.name} subscription data has been reset.`)
                .addFields(
                    { name: '📋 Type', value: config.name, inline: true },
                    { name: '📍 Ranges Cleared', value: 'B3:C14, E3:E14, G3:G14', inline: true }
                )
                .setTimestamp()
                .setFooter({
                    text: `Reset by ${username}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in /reset command:', error);

            let errorMessage = '❌ An error occurred while resetting data.';

            if (error.message.includes('PERMISSION_DENIED')) {
                errorMessage = '❌ Bot does not have write access to Google Sheet. Make sure the Service Account has Editor access.';
            } else if (error.message.includes('Unable to parse range')) {
                errorMessage = `❌ Sheet "${config.sheet}" not found. Please create the sheet first.`;
            }

            await interaction.editReply({ content: errorMessage });
        }
    }
};
