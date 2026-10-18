// 音乐管理器
class AudioManager {
  constructor() {
    this.bgm = null;
    this.isMuted = false;
    this.isLoaded = false;
  }

  async init() {
    try {
      // 创建音频元素
      this.bgm = new Audio('background.mp3');
      this.bgm.loop = true;
      this.bgm.volume = 0.3; // 30% 音量

      // 监听加载完成
      this.bgm.addEventListener('canplaythrough', () => {
        this.isLoaded = true;
        console.log('🎵 背景音乐加载完成');
      });

      // 监听错误（文件不存在时）
      this.bgm.addEventListener('error', (e) => {
        console.log('ℹ️ 背景音乐文件未找到（这是正常的，需要添加mp3文件）');
        this.isLoaded = false;
      });

      // 预加载
      this.bgm.load();
    } catch (err) {
      console.log('ℹ️ 音频初始化跳过:', err.message);
    }
  }

  play() {
    if (this.bgm && this.isLoaded && !this.isMuted) {
      this.bgm.play().catch(err => {
        console.log('ℹ️ 自动播放被浏览器阻止（需要用户交互后播放）');
      });
    }
  }

  pause() {
    if (this.bgm) {
      this.bgm.pause();
    }
  }

  toggle() {
    this.isMuted = !this.isMuted;
    if (this.bgm) {
      if (this.isMuted) {
        this.pause();
      } else {
        this.play();
      }
    }
    return this.isMuted;
  }

  setVolume(volume) {
    if (this.bgm) {
      this.bgm.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

// 创建全局实例
const audioManager = new AudioManager();

// 自动初始化
audioManager.init();

// 监听用户第一次交互后自动播放
document.addEventListener('click', () => {
  audioManager.play();
}, { once: true });

export { audioManager };
