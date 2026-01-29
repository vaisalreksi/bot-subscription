import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Lihat profil kamu'),

    async execute(interaction) {
        const user = interaction.user;
        const member = interaction.member;

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('👤 Profil Kamu')
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🆔 User ID', value: `\`${user.id}\``, inline: true },
                { name: '📛 Username', value: `\`${user.username}\``, inline: true },
                { name: '✨ Display Name', value: `\`${user.globalName || user.username}\``, inline: true },
                { name: '🏷️ Tag', value: `\`${user.tag}\``, inline: true },
                { name: '🤖 Bot', value: user.bot ? 'Ya' : 'Tidak', inline: true },
                { name: '📅 Akun Dibuat', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: `Diminta oleh ${user.username}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();

        // Add server nickname if in a guild
        if (member?.nickname) {
            embed.addFields({ name: '🏠 Nickname Server', value: `\`${member.nickname}\``, inline: true });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
