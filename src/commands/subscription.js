import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import googleSheetsService from '../services/googleSheets.js';

// Configuration for each subscription type
const CONFIG = {
    google: {
        name: 'Google Workspace',
        emoji: '☁️',
        color: 0x4285F4,
        sheet: 'Google'
    },
    vps: {
        name: 'VPS',
        emoji: '🖥️',
        color: 0x5865F2,
        sheet: 'VPS'
    },
    domain: {
        name: 'Domain',
        emoji: '🌐',
        color: 0x34A853,
        sheet: 'Domain'
    }
};

export default {
    data: new SlashCommandBuilder()
        .setName('subscription')
        .setDescription('View subscription data')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of subscription')
                .setRequired(true)
                .addChoices(
                    { name: '☁️ Google Workspace', value: 'google' },
                    { name: '🖥️ VPS', value: 'vps' },
                    { name: '🌐 Domain', value: 'domain' }
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const type = interaction.options.getString('type');
        const username = interaction.user.username;
        const config = CONFIG[type];

        try {
            const data = await googleSheetsService.getSheetData(
                process.env.GOOGLE_SHEET_ID,
                `${config.sheet}!A1:G15`
            );

            if (!data || data.length === 0) {
                await interaction.editReply({
                    content: `❌ No data found in ${config.name} sheet.`
                });
                return;
            }

            // Calculate column widths
            const colWidths = [];
            for (let col = 0; col < 7; col++) {
                let maxWidth = 0;
                for (const row of data) {
                    const cellValue = row[col] || '';
                    maxWidth = Math.max(maxWidth, String(cellValue).length);
                }
                colWidths.push(Math.min(maxWidth, 12)); // Cap at 12 chars
            }

            // Build table as text
            let table = '```\n';

            for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
                const row = data[rowIdx];
                let line = '';

                for (let col = 0; col < 7; col++) {
                    const cellValue = String(row[col] || '').substring(0, 12);
                    line += cellValue.padEnd(colWidths[col] + 1);
                }

                table += line.trimEnd() + '\n';

                // Add separator after header
                if (rowIdx === 0) {
                    let separator = '';
                    for (let col = 0; col < 7; col++) {
                        separator += '-'.repeat(colWidths[col]) + ' ';
                    }
                    table += separator.trimEnd() + '\n';
                }
            }

            table += '```';

            // Discord has 2000 char limit, split if needed
            if (table.length > 1900) {
                table = table.substring(0, 1900) + '...\n```';
            }

            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`${config.emoji} ${config.name} Subscription`)
                .setDescription(table)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${username}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in /subscription command:', error);

            let errorMessage = '❌ An error occurred while fetching data.';

            if (error.message.includes('PERMISSION_DENIED')) {
                errorMessage = '❌ Bot does not have access to Google Sheet. Make sure the Service Account has been granted access.';
            } else if (error.message.includes('Unable to parse range')) {
                errorMessage = `❌ Sheet "${config.sheet}" not found. Please create the sheet first.`;
            }

            await interaction.editReply({ content: errorMessage });
        }
    }
};
