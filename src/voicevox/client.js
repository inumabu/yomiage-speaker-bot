const axios = require('axios');

const VOICEVOX_URL = process.env.VOICEVOX_URL || 'http://localhost:50021';

async function generateAudio(text, speakerId, settings = {}) {
  // 1. 音声クエリの作成
  const queryResponse = await axios.post(`${VOICEVOX_URL}/audio_query`, null, {
    params: { text, speaker: speakerId }
  });

  const audioQuery = queryResponse.data;

  // パラメータの設定（デフォルト値を維持）
  audioQuery.speedScale = settings.speed_scale ?? 1.0;
  audioQuery.pitchScale = settings.pitch_scale ?? 0.0;
  audioQuery.intonationScale = settings.intonation_scale ?? 1.0;
  audioQuery.volumeScale = settings.volume_scale ?? 1.0;

  // 2. 音声合成
  const synthesisResponse = await axios.post(`${VOICEVOX_URL}/synthesis`, audioQuery, {
    params: { speaker: speakerId },
    responseType: 'arraybuffer'
  });

  return Buffer.from(synthesisResponse.data);
}

module.exports = { generateAudio };