const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('join')
    .setDescription('ボイスチャンネルに接続して読み上げを開始します')
    .setDefaultMemberPermissions(PermissionFlagsBits.Connect),

  new SlashCommandBuilder()
    .setName('leave')
    .setDescription('ボイスチャンネルから切断します'),

  new SlashCommandBuilder()
    .setName('voice')
    .setDescription('読み上げ音声や話者を設定します'),

  new SlashCommandBuilder()
    .setName('dict-add')
    .setDescription('辞書に単語を追加します')
    .addStringOption(option =>
      option.setName('source')
        .setDescription('置換前の単語 (1〜100文字)')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(100))
    .addStringOption(option =>
      option.setName('reading')
        .setDescription('読み方 (1〜100文字)')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(100)),

  new SlashCommandBuilder()
    .setName('dict-delete')
    .setDescription('辞書から単語を削除します')
    .addStringOption(option =>
      option.setName('source')
        .setDescription('削除する単語')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('dict-list')
    .setDescription('登録されている辞書一覧を表示します')
];

module.exports = { commands };