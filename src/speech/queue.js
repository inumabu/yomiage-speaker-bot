const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { generateAudio } = require('../voicevox/client');
const { Readable } = require('stream');

class GuildSpeechQueue {
  constructor() {
    this.queues = new Map(); // guildId -> { queue: [], player: AudioPlayer, isPlaying: boolean }
  }

  getOrCreate(guildId, connection) {
    if (!this.queues.has(guildId)) {
      const player = createAudioPlayer();
      connection.subscribe(player);

      const state = { queue: [], player, isPlaying: false, connection };

      player.on(AudioPlayerStatus.Idle, () => {
        state.isPlaying = false;
        this.processNext(guildId);
      });

      this.queues.set(guildId, state);
    }
    return this.queues.get(guildId);
  }

  async enqueue(guildId, connection, text, speakerId, settings) {
    const state = this.getOrCreate(guildId, connection);
    state.queue.push({ text, speakerId, settings });

    if (!state.isPlaying) {
      await this.processNext(guildId);
    }
  }

  async processNext(guildId) {
    const state = this.queues.get(guildId);
    if (!state || state.queue.length === 0 || state.isPlaying) return;

    state.isPlaying = true;
    const item = state.queue.shift();

    try {
      const audioBuffer = await generateAudio(item.text, item.speakerId, item.settings);
      const resource = createAudioResource(Readable.from(audioBuffer));
      state.player.play(resource);
    } catch (err) {
      console.error(`[Speech Error] Guild: ${guildId}`, err);
      state.isPlaying = false;
      this.processNext(guildId);
    }
  }

  clear(guildId) {
    const state = this.queues.get(guildId);
    if (state) {
      state.player.stop();
      state.queue = [];
      this.queues.delete(guildId);
    }
  }
}

module.exports = new GuildSpeechQueue();