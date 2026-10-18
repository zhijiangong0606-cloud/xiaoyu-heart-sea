/** 游戏进阶系统：等级、技能、道具 */

// 等级配置
export const LEVELS_CONFIG = [
  { level: 1, name: '新手小鱼', exp: 0, color: '#FFB3D9' },
  { level: 2, name: '见习小鱼', exp: 100, color: '#FF9ECE' },
  { level: 3, name: '熟练小鱼', exp: 300, color: '#FF85C3' },
  { level: 4, name: '专家小鱼', exp: 600, color: '#FF6BB8' },
  { level: 5, name: '传说小鱼', exp: 1000, color: '#FF1493' },
];

// 技能配置
export const SKILLS = {
  shield: {
    name: '星光护盾',
    level: 1,
    cooldown: 0,
    duration: 6,
    desc: '获得6秒保护，抵挡一次伤害'
  },
  slowTime: {
    name: '时间暂停',
    level: 2,
    cooldown: 25,
    duration: 3,
    desc: '时间减速70%，持续3秒'
  },
  magnet: {
    name: '磁力吸引',
    level: 3,
    cooldown: 20,
    duration: 5,
    desc: '自动吸引附近星光'
  },
  clone: {
    name: '分身术',
    level: 4,
    cooldown: 30,
    duration: 8,
    desc: '产生两个分身帮忙收集'
  },
  teleport: {
    name: '传送',
    level: 5,
    cooldown: 15,
    duration: 0,
    desc: '瞬移到指定位置'
  },
};

// 道具配置
export const ITEMS = {
  candy: {
    name: '彩虹糖',
    duration: 10,
    effect: 'speed',
    value: 1.5,
    color: '#FFA3D7',
    desc: '移动速度+50%'
  },
  heart: {
    name: '能量饮料',
    duration: 0,
    effect: 'heal',
    value: 1,
    color: '#FF6B9D',
    desc: '恢复1颗爱心'
  },
  clover: {
    name: '幸运四叶草',
    duration: 30,
    effect: 'score',
    value: 2,
    color: '#90EE90',
    desc: '得分翻倍30秒'
  },
  clock: {
    name: '时钟',
    duration: 0,
    effect: 'time',
    value: 10,
    color: '#87CEEB',
    desc: '额外时间+10秒'
  },
  chest: {
    name: '宝箱',
    duration: 0,
    effect: 'random',
    value: 0,
    color: '#FFD700',
    desc: '随机获得一个道具'
  },
};

// 成就配置
export const ACHIEVEMENTS = [
  { id: 'collector1', name: '收集新手', desc: '收集100颗星光', target: 100, reward: 50 },
  { id: 'collector2', name: '收集达人', desc: '收集500颗星光', target: 500, reward: 150 },
  { id: 'collector3', name: '收集大师', desc: '收集1000颗星光', target: 1000, reward: 300 },
  { id: 'combo1', name: '连击入门', desc: '达到10连击', target: 10, reward: 30 },
  { id: 'combo2', name: '连击高手', desc: '达到20连击', target: 20, reward: 80 },
  { id: 'combo3', name: '连击大师', desc: '达到50连击', target: 50, reward: 200 },
  { id: 'perfect', name: '完美通关', desc: '不受伤通关任意关卡', target: 1, reward: 100 },
  { id: 'speed', name: '速度之星', desc: '30秒内通关任意关卡', target: 1, reward: 100 },
  { id: 'allitems', name: '道具收集家', desc: '收集过所有类型道具', target: 5, reward: 150 },
];

export class ProgressSystem {
  constructor() {
    this.level = 1;
    this.exp = 0;
    this.totalStars = 0;
    this.maxCombo = 0;
    this.achievements = new Set();
    this.itemsCollected = new Set();
    this.skills = new Map();
    this.activeEffects = [];
  }

  addExp(amount) {
    this.exp += amount;
    const oldLevel = this.level;

    // 检查升级
    while (this.level < LEVELS_CONFIG.length) {
      const nextLevelConfig = LEVELS_CONFIG[this.level];
      if (this.exp >= nextLevelConfig.exp) {
        this.level++;
      } else {
        break;
      }
    }

    return this.level > oldLevel;
  }

  getCurrentLevelConfig() {
    return LEVELS_CONFIG[this.level - 1];
  }

  getNextLevelConfig() {
    return LEVELS_CONFIG[this.level];
  }

  getExpProgress() {
    if (this.level >= LEVELS_CONFIG.length) return 1;
    const current = this.getCurrentLevelConfig();
    const next = this.getNextLevelConfig();
    return (this.exp - current.exp) / (next.exp - current.exp);
  }

  canUseSkill(skillKey) {
    const skill = SKILLS[skillKey];
    if (!skill || this.level < skill.level) return false;

    const cooldown = this.skills.get(skillKey) || 0;
    return cooldown <= 0;
  }

  useSkill(skillKey) {
    if (!this.canUseSkill(skillKey)) return false;

    const skill = SKILLS[skillKey];
    this.skills.set(skillKey, skill.cooldown);
    return true;
  }

  updateCooldowns(dt) {
    for (const [key, cooldown] of this.skills.entries()) {
      if (cooldown > 0) {
        this.skills.set(key, Math.max(0, cooldown - dt));
      }
    }

    // 更新主动效果
    this.activeEffects = this.activeEffects.filter(effect => {
      effect.remaining -= dt;
      return effect.remaining > 0;
    });
  }

  addEffect(itemKey) {
    const item = ITEMS[itemKey];
    if (!item) return;

    if (item.effect === 'heal') {
      return { type: 'heal', value: item.value };
    } else if (item.effect === 'time') {
      return { type: 'time', value: item.value };
    } else if (item.effect === 'random') {
      const items = Object.keys(ITEMS).filter(k => k !== 'chest');
      const randomItem = items[Math.floor(Math.random() * items.length)];
      return this.addEffect(randomItem);
    } else {
      this.activeEffects.push({
        type: item.effect,
        value: item.value,
        remaining: item.duration,
      });
      return { type: item.effect, value: item.value, duration: item.duration };
    }
  }

  getSpeedMultiplier() {
    const speedEffect = this.activeEffects.find(e => e.type === 'speed');
    return speedEffect ? speedEffect.value : 1;
  }

  getScoreMultiplier() {
    const scoreEffect = this.activeEffects.find(e => e.type === 'score');
    return scoreEffect ? scoreEffect.value : 1;
  }

  checkAchievement(id, value) {
    if (this.achievements.has(id)) return false;

    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (!achievement) return false;

    if (value >= achievement.target) {
      this.achievements.add(id);
      return achievement;
    }

    return false;
  }

  updateStats(stats) {
    this.totalStars += stats.collected || 0;
    this.maxCombo = Math.max(this.maxCombo, stats.combo || 0);

    // 检查成就
    const newAchievements = [];

    const collector1 = this.checkAchievement('collector1', this.totalStars);
    if (collector1) newAchievements.push(collector1);

    const collector2 = this.checkAchievement('collector2', this.totalStars);
    if (collector2) newAchievements.push(collector2);

    const collector3 = this.checkAchievement('collector3', this.totalStars);
    if (collector3) newAchievements.push(collector3);

    if (stats.combo) {
      const combo1 = this.checkAchievement('combo1', stats.combo);
      if (combo1) newAchievements.push(combo1);

      const combo2 = this.checkAchievement('combo2', stats.combo);
      if (combo2) newAchievements.push(combo2);

      const combo3 = this.checkAchievement('combo3', stats.combo);
      if (combo3) newAchievements.push(combo3);
    }

    if (stats.noDamage) {
      const perfect = this.checkAchievement('perfect', 1);
      if (perfect) newAchievements.push(perfect);
    }

    if (stats.fastClear) {
      const speed = this.checkAchievement('speed', 1);
      if (speed) newAchievements.push(speed);
    }

    if (this.itemsCollected.size >= 5) {
      const allItems = this.checkAchievement('allitems', this.itemsCollected.size);
      if (allItems) newAchievements.push(allItems);
    }

    return newAchievements;
  }

  toJSON() {
    return {
      level: this.level,
      exp: this.exp,
      totalStars: this.totalStars,
      maxCombo: this.maxCombo,
      achievements: Array.from(this.achievements),
      itemsCollected: Array.from(this.itemsCollected),
    };
  }

  fromJSON(data) {
    if (!data) return;
    this.level = data.level || 1;
    this.exp = data.exp || 0;
    this.totalStars = data.totalStars || 0;
    this.maxCombo = data.maxCombo || 0;
    this.achievements = new Set(data.achievements || []);
    this.itemsCollected = new Set(data.itemsCollected || []);
  }
}
