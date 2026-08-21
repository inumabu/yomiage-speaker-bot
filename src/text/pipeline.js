const KAOMOJI_MAP = [
  { pattern: /(´・ω・｀)/g, replacement: 'しょんぼり' },
  { pattern: /(´；ω；｀)/g, replacement: '泣き' },
  { pattern: /＼\(\^o\^\)／/g, replacement: 'ばんざい' },
  { pattern: /（＾ω＾）/g, replacement: 'にっこり' },
  { pattern: /[wｗWＷ]{3,}/g, replacement: '笑い' },
  { pattern: /^(w|ｗ)$/gi, replacement: '笑い' }
];

/**
 * 読み上げテキストの前処理パイプライン
 */
async function processText(text, dictionary = []) {
  if (!text) return '';

  let sanitized = text;

  // 1. URLの置換
  sanitized = sanitized.replace(/https?:\/\/\S+/g, 'URL省略');

  // 2. メンションの置換 (ユーザー・ロール・チャンネル)
  sanitized = sanitized
    .replace(/<@!?(\d+)>/g, 'ユーザーメンション')
    .replace(/<@&(\d+)>/g, 'ロールメンション')
    .replace(/<#(\d+)>/g, 'チャンネルメンション');

  // 3. 顔文字・wの置換
  for (const { pattern, replacement } of KAOMOJI_MAP) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  // 4. サーバー固有辞書の適用（長文一致優先）
  const sortedDict = [...dictionary].sort((a, b) => b.source.length - a.source.length);
  for (const entry of sortedDict) {
    if (entry.source) {
      sanitized = sanitized.replaceAll(entry.source, entry.reading);
    }
  }

  return sanitized.trim();
}

module.exports = { processText };