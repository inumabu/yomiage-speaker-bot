const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { pool } = require('../database');
const speechQueue = require('../speech/queue');

async function handleInteraction(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, guildId, member, channel } = interaction;

  if (commandName === 'join') {
    const voiceChannel = member?.voice?.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: 'ボイスチャンネルに参加してから実行してください。', ephemeral: true });
    }

    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    return interaction.reply(`🔊 **${voiceChannel.name}** に接続しました。読み上げを開始します。`);
  }

  if (commandName === 'leave') {
    const connection = getVoiceConnection(guildId);
    if (!connection) {
      return interaction.reply({ content: 'Botはボイスチャンネルに接続していません。', ephemeral: true });
    }

    speechQueue.clear(guildId);
    connection.destroy();
    return interaction.reply('👋 ボイスチャンネルから切断しました。');
  }

  if (commandName === 'dict-add') {
    const source = interaction.options.getString('source');
    const reading = interaction.options.getString('reading');

    await pool.query(
      'INSERT INTO guild_dictionary (guild_id, source, reading) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE reading = ?',
      [guildId, source, reading, reading]
    );

    return interaction.reply({ content: `📖 辞書登録: **${source}** ➔ **${reading}**`, ephemeral: true });
  }

  if (commandName === 'dict-delete') {
    const source = interaction.options.getString('source');

    const [result] = await pool.query(
      'DELETE FROM guild_dictionary WHERE guild_id = ? AND source = ?',
      [guildId, source]
    );

    if (result.affectedRows === 0) {
      return interaction.reply({ content: `❌ **${source}** は辞書に登録されていません。`, ephemeral: true });
    }

    return interaction.reply({ content: `🗑️ **${source}** を辞書から削除しました。`, ephemeral: true });
  }

  if (commandName === 'dict-list') {
    const [rows] = await pool.query('SELECT source, reading FROM guild_dictionary WHERE guild_id = ?', [guildId]);

    if (rows.length === 0) {
      return interaction.reply({ content: '📖 辞書には何も登録されていません。', ephemeral: true });
    }

    const listText = rows.map(r => `・**${r.source}** ➔ ${r.reading}`).join('\n');
    return interaction.reply({ content: `📖 **登録済み辞書一覧 (${rows.length}件):**\n${listText}`, ephemeral: true });
  }
}

module.exports = { handleInteraction };