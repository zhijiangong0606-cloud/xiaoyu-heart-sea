/** 音乐和音效管理器 */

export class AudioManager {
  constructor() {
    this.bgmEnabled = false;
    this.sfxEnabled = false;
    this.bgm = null;
    this.audioContext = null;
    this.bgmVolume = 0.4;
    this.sfxVolume = 0.5;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    try {
      // iOS需要用户交互后才能播放
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // 创建背景音乐元素
      this.bgm = new Audio('./bgm.mp3');
      this.bgm.loop = true;
      this.bgm.volume = this.bgmVolume;

      // iOS兼容性处理
      this.bgm.load();

      this.initialized = true;
    } catch (e) {
      console.warn('音频初始化失败:', e);
    }
  }

  async playBGM() {
    if (!this.bgmEnabled || !this.bgm) return;
    try {
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }
      await this.bgm.play();
    } catch (e) {
      console.warn('背景音乐播放失败:', e);
    }
  }

  pauseBGM() {
    if (this.bgm) {
      this.bgm.pause();
    }
  }

  stopBGM() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }
  }

  setBGMVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgm) {
      this.bgm.volume = this.bgmVolume;
    }
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  toggleBGM() {
    this.bgmEnabled = !this.bgmEnabled;
    if (this.bgmEnabled) {
      this.playBGM();
    } else {
      this.pauseBGM();
    }
    return this.bgmEnabled;
  }

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  // 可爱音效生成器
  tone(freq, duration = 0.12, type = 'sine', gain = 0.035, delay = 0) {
    if (!this.sfxEnabled || !this.audioContext) return;

    const now = this.audioContext.currentTime + delay;
    const osc = this.audioContext.createOscillator();
    const vol = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    vol.gain.setValueAtTime(0, now);
    vol.gain.linearRampToValueAtTime(gain * this.sfxVolume, now + 0.012);
    vol.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(vol);
    vol.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  // 可爱版音效
  sound(type) {
    switch(type) {
      case 'collect':
        // 更明亮清脆的收集音效
        this.tone(880, 0.13);
        this.tone(1320, 0.18, 'sine', 0.025, 0.06);
        break;
      case 'dash':
        this.tone(440, 0.17, 'triangle', 0.024);
        this.tone(660, 0.15, 'sine', 0.02, 0.04);
        break;
      case 'hit':
        // 柔和的受伤音效
        this.tone(220, 0.2, 'sine', 0.025);
        break;
      case 'shield':
        this.tone(660, 0.2);
        this.tone(880, 0.25, 'sine', 0.025, 0.08);
        break;
      case 'win':
        // 欢快的胜利音效
        [659, 784, 988, 1319].forEach((f, i) =>
          this.tone(f, 0.35, 'sine', 0.035, i * 0.12)
        );
        break;
      case 'lose':
        this.tone(440, 0.2);
        this.tone(330, 0.3, 'sine', 0.025, 0.15);
        break;
      case 'levelup':
        // 升级音效
        [523, 659, 784, 1047, 1319].forEach((f, i) =>
          this.tone(f, 0.25, 'sine', 0.03, i * 0.08)
        );
        break;
      case 'combo':
        // 连击音效
        this.tone(1047, 0.1, 'sine', 0.04);
        this.tone(1319, 0.15, 'sine', 0.035, 0.05);
        break;
      case 'powerup':
        // 道具获得
        [880, 1047, 1319].forEach((f, i) =>
          this.tone(f, 0.2, 'sine', 0.03, i * 0.06)
        );
        break;
      case 'dog':
        // GZJ小狗叫声（可爱版）
        this.tone(330, 0.08, 'triangle', 0.03);
        this.tone(440, 0.08, 'triangle', 0.025, 0.09);
        break;
    }
  }
}
