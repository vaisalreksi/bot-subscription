import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import googleSheetsService from '../services/googleSheets.js';

// Configuration for each subscription type
const CONFIG = {
    google: {
        name: 'Google Workspace',
        emoji: '☁️',
        color: 0x00FF00,
        sheet: 'Google'
    },
    vps: {
        name: 'VPS',
        emoji: '🖥️',
        color: 0x00FF00,
        sheet: 'VPS'
    },
    domain: {
        name: 'Domain',
        emoji: '🌐',
        color: 0x00FF00,
        sheet: 'Domain'
    }
};

export default {
    data: new SlashCommandBuilder()
        .setName('addbill')
        .setDescription('Add a bill payment record')
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
        )
        .addNumberOption(option =>
            option
                .setName('nominal')
                .setDescription('Payment amount')
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option
                .setName('proof')
                .setDescription('Payment proof image')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const type = interaction.options.getString('type');
        const nominal = interaction.options.getNumber('nominal');
        const proof = interaction.options.getAttachment('proof');
        const username = interaction.user.username;
        const config = CONFIG[type];

        // Validate attachment is an image
        const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(proof.contentType)) {
            await interaction.editReply({
                content: '❌ Please upload a valid image file (PNG, JPG, GIF, or WebP).'
            });
            return;
        }

        try {
            // Get current date in MM/DD/YYYY format
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            });

            // Format nominal with thousand separator
            const formattedNominal = nominal.toLocaleString('id-ID');

            // Add entry to sheet
            const rowInserted = await googleSheetsService.addBillEntry(config.sheet, dateStr, nominal);

            // Create success embed
            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('✅ Bill Payment Recorded')
                .setDescription('Your payment has been successfully recorded!')
                .addFields(
                    { name: '📋 Type', value: config.name, inline: true },
                    { name: '💰 Amount', value: `Rp ${formattedNominal}`, inline: true },
                    { name: '📅 Date', value: dateStr, inline: true },
                    { name: '📍 Row', value: `Row ${rowInserted}`, inline: true }
                )
                .setImage(proof.url)
                .setTimestamp()
                .setFooter({
                    text: `Added by ${username}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in /addbill command:', error);

            let errorMessage = '❌ An error occurred while recording the payment.';

            if (error.message.includes('PERMISSION_DENIED')) {
                errorMessage = '❌ Bot does not have write access to Google Sheet. Make sure the Service Account has Editor access.';
            } else if (error.message.includes('full')) {
                errorMessage = '❌ ' + error.message;
            } else if (error.message.includes('Unable to parse range')) {
                errorMessage = `❌ Sheet "${config.sheet}" not found. Please create the sheet first.`;
            }

            await interaction.editReply({ content: errorMessage });
        }
    }
};
