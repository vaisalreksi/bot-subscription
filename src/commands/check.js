import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import googleSheetsService from '../services/googleSheets.js';

// Configuration for each subscription type
const CONFIG = {
    google: {
        name: 'Google Workspace',
        emoji: '☁️',
        color: 0x4285F4,
        sheet: 'Google',
        billCell: { cucudukun: 'F15', default: 'D15' }
    },
    vps: {
        name: 'VPS',
        emoji: '🖥️',
        color: 0x5865F2,
        sheet: 'VPS',
        billCell: { cucudukun: 'G15', default: 'E15' }
    },
    domain: {
        name: 'Domain',
        emoji: '🌐',
        color: 0x34A853,
        sheet: 'Domain',
        billCell: { cucudukun: 'G15', default: 'E15' }
    }
};

export default {
    data: new SlashCommandBuilder()
        .setName('check')
        .setDescription('Check subscription status')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of subscription to check')
                .setRequired(true)
                .addChoices(
                    { name: '🖥️ VPS', value: 'vps' },
                    { name: '☁️ Google Workspace', value: 'google' },
                    { name: '🌐 Domain', value: 'domain' }
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const type = interaction.options.getString('type');
        const username = interaction.user.username;
        const config = CONFIG[type];

        try {
            // Get cell based on username
            const cell = username === 'cucudukun' ? config.billCell.cucudukun : config.billCell.default;
            const range = `${config.sheet}!${cell}`;

            const data = await googleSheetsService.getSheetData(
                process.env.GOOGLE_SHEET_ID,
                range
            );

            const value = data?.[0]?.[0] || '0';

            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`${config.emoji} ${config.name} Subscription`)
                .setDescription(`Your bill is **${value}**`)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${username}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in /check command:', error);

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
