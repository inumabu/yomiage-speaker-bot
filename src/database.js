const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'yomiage',
  waitForConnections: true,
  connectionLimit: 10
});

async function getUserSettings(guildId, userId) {
  const [rows] = await pool.query(
    'SELECT * FROM user_settings WHERE guild_id = ? AND user_id = ?',
    [guildId, userId]
  );
  return rows[0] || null;
}

async function getGuildDictionary(guildId) {
  const [rows] = await pool.query(
    'SELECT source, reading FROM guild_dictionary WHERE guild_id = ?',
    [guildId]
  );
  return rows;
}

module.exports = { pool, getUserSettings, getGuildDictionary };