/** Pure, deterministic game rules. All distances are in the 1000 × 650 world. */
export const W = 1000;
export const H = 650;
export const BOUNDS = Object.freeze({ left: 35, right: 965, top: 90, bottom: 560 });

export const LEVELS = Object.freeze([
  Object.freeze({ id: 1, name: '浅浅心动', subtitle: '沿着星光，慢慢靠近', target: 8, duration: 50, hazards: 3, note: '今天的第一颗星光，想先送给你。' }),
  Object.freeze({ id: 2, name: '珊瑚来信', subtitle: '躲过小水母，把心意攒起来', target: 12, duration: 55, hazards: 5, note: '和小鱼一起的普通日子，也会悄悄发光。' }),
  Object.freeze({ id: 3, name: '星光都给你', subtitle: '这片海里，最想遇见的是你', target: 16, duration: 60, hazards: 7, note: '小宝宝，天天开心呀！永远是最棒的小鱼。' }),
  Object.freeze({ id: 4, name: '梦幻泡泡岛', subtitle: 'GZJ带你去看粉色的梦', target: 18, duration: 70, hazards: 9, note: 'GZJ说：小鱼的笑容，是海里最美的风景。' }),
  Object.freeze({ id: 5, name: 'GZJ的秘密花园', subtitle: '藏着最多星光的地方', target: 22, duration: 80, hazards: 11, note: '这个花园，是GZJ为最棒的小鱼准备的礼物！🐕💕' }),
]);

const PATH = [
  [320, 325], [430, 245], [555, 175], [690, 210],
  [820, 290], [865, 420], [735, 490], [590, 460],
  [455, 490], [325, 430], [185, 470], [100, 350],
  [120, 210], [260, 150], [405, 130], [805, 145],
  // 新增位置用于第4和第5关
  [650, 350], [500, 300], [380, 250], [720, 420],
  [560, 520], [210, 280], [450, 380], [620, 180],
  [750, 260], [340, 480],
];
const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const overlaps = (a, b, extra = 0) => Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius + extra;
const distanceToSegment = (point, start, end) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const progress = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(point.x - start.x - progress * dx, point.y - start.y - progress * dy);
};

export class SeaGame {
  constructor({ rng = Math.random, onEvent = () => {} } = {}) {
    this.rng = rng;
    this.onEvent = onEvent;
    this.state = 'idle';
    this.levelIndex = 0;
    this.endless = false;
    this.level = LEVELS[0];
    this.player = { x: 200, y: 325, vx: 0, vy: 0, radius: 20, invincible: 0, dashTime: 0 };
    this.stars = [];
    this.hazards = [];
    this.pickups = [];
    this.items = []; // 新增：道具列表
    this.particles = [];
    this.events = [];
    this.timeLeft = this.level.duration;
    this.elapsed = 0;
    this.collected = 0;
    this.score = 0;
    this.lives = 3;
    this.combo = 0;
    this.bestCombo = 0;
    this.dashCooldown = 0;
    this.shieldTime = 0;
    this.speedBoost = 1; // 新增：速度加成
    this.scoreMultiplier = 1; // 新增：得分倍数
    this._comboTime = 0;
    this._id = 0;
    this._facing = { x: 1, y: 0 };
    this._nextHazardAt = 16;
    this._nextPickupAt = 12;
    this._nextItemAt = 20; // 新增：下一个道具生成时间
    this._noDamage = true; // 新增：无伤记录
    this._startTime = 0; // 新增：开始时间
  }

  start(levelIndex = 0, endless = false) {
    this.levelIndex = clamp(Math.trunc(Number(levelIndex) || 0), 0, LEVELS.length - 1);
    this.level = LEVELS[this.levelIndex];
    this.endless = Boolean(endless);
    this.state = 'playing';
    this.player = { x: 200, y: 325, vx: 0, vy: 0, radius: 20, invincible: 0, dashTime: 0 };
    this.elapsed = 0;
    this.timeLeft = this.endless ? Infinity : this.level.duration;
    this.collected = 0;
    this.score = 0;
    this.lives = 3;
    this.combo = 0;
    this.bestCombo = 0;
    this.dashCooldown = 0;
    this.shieldTime = 0;
    this.speedBoost = 1;
    this.scoreMultiplier = 1;
    this._comboTime = 0;
    this._id = 0;
    this._facing = { x: 1, y: 0 };
    this._nextHazardAt = 16;
    this._nextPickupAt = 12;
    this._nextItemAt = 20;
    this._noDamage = true;
    this._startTime = 0;
    this.events = [];
    this.particles = [];
    this.hazards = [];
    this.pickups = [];
    this.items = [];
    this.stars = PATH.slice(0, this.endless ? 8 : this.level.target).map(([x, y], routeIndex) => ({
      id: ++this._id, x, y, radius: 13, phase: this._random() * TAU, routeIndex,
    }));
    for (let i = 0; i < this.level.hazards; i++) this._addHazard();
    this._addPickup();
    return this;
  }

  pause() {
    if (this.state === 'playing') this.state = 'paused';
    return this.state;
  }

  resume() {
    if (this.state === 'paused') this.state = 'playing';
    return this.state;
  }

  dash() {
    if (this.state !== 'playing' || this.dashCooldown > 0) return false;
    this.player.dashTime = 0.35;
    this.player.invincible = Math.max(this.player.invincible, 0.35);
    this.dashCooldown = 3.2;
    this._emit('dash', { x: this.player.x, y: this.player.y });
    return true;
  }

  update(dt, input = {}) {
    if (this.state !== 'playing') return this;
    dt = clamp(Number.isFinite(dt) ? dt : 0, 0, 0.05);
    if (dt === 0) return this;
    input = input || {};
    this.elapsed += dt;
    if (!this.endless) {
      this.timeLeft = Math.max(0, this.timeLeft - dt);
      if (this.timeLeft <= 1e-8) {
        this.timeLeft = 0;
        this._finish(false, 'time');
        return this;
      }
    }

    const dashing = this.player.dashTime > 0;
    this.player.invincible = Math.max(0, this.player.invincible - dt);
    this.player.dashTime = Math.max(0, this.player.dashTime - dt);
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.shieldTime = Math.max(0, this.shieldTime - dt);
    this._comboTime = Math.max(0, this._comboTime - dt);
    if (this._comboTime <= 0) this.combo = 0;

    const speed = (dashing ? 530 : 225) * this.speedBoost;
    let dx = Number.isFinite(input.x) ? input.x : 0;
    let dy = Number.isFinite(input.y) ? input.y : 0;
    if (input.target && Number.isFinite(input.target.x) && Number.isFinite(input.target.y)) {
      dx = clamp(input.target.x, BOUNDS.left, BOUNDS.right) - this.player.x;
      dy = clamp(input.target.y, BOUNDS.top, BOUNDS.bottom) - this.player.y;
      const distance = Math.hypot(dx, dy);
      const magnitude = Math.min(1, distance / (speed * dt));
      dx = distance > 0 ? dx / distance * magnitude : 0;
      dy = distance > 0 ? dy / distance * magnitude : 0;
    } else {
      const magnitude = Math.hypot(dx, dy);
      if (magnitude > 1) { dx /= magnitude; dy /= magnitude; }
    }
    if (Math.hypot(dx, dy) > 0.001) {
      const magnitude = Math.hypot(dx, dy);
      this._facing = { x: dx / magnitude, y: dy / magnitude };
    } else if (dashing && !input.target) {
      dx = this._facing.x;
      dy = this._facing.y;
    }
    this.player.vx = dx * speed;
    this.player.vy = dy * speed;
    this.player.x = clamp(this.player.x + this.player.vx * dt, BOUNDS.left, BOUNDS.right);
    this.player.y = clamp(this.player.y + this.player.vy * dt, BOUNDS.top, BOUNDS.bottom);

    for (const hazard of this.hazards) {
      hazard.x += hazard.vx * dt;
      hazard.y += (hazard.vy + Math.sin(this.elapsed * 1.4 + hazard.phase) * 9) * dt;
      if (hazard.x < 60 || hazard.x > 940) {
        hazard.x = clamp(hazard.x, 60, 940);
        hazard.vx *= -1;
      }
      if (hazard.y < 115 || hazard.y > 535) {
        hazard.y = clamp(hazard.y, 115, 535);
        hazard.vy *= -1;
      }
    }

    // Traverse only the old stars; endless replacements cannot be collected twice.
    const collectedStars = this.stars.filter(star => overlaps(this.player, star));
    if (collectedStars.length) {
      const ids = new Set(collectedStars.map(star => star.id));
      this.stars = this.stars.filter(star => !ids.has(star.id));
      for (const star of collectedStars) {
        this.collected++;
        this.combo++;
        this.bestCombo = Math.max(this.bestCombo, this.combo);
        this._comboTime = 3;
        const points = Math.floor((100 + Math.min(180, (this.combo - 1) * 20)) * this.scoreMultiplier);
        this.score += points;
        this._emit('collect', { id: star.id, x: star.x, y: star.y, points, combo: this.combo, collected: this.collected });
        if (this.endless) this._addStar();
      }
      if (!this.endless && this.collected >= this.level.target) {
        this._finish(true, 'target');
        return this;
      }
    }

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pickup = this.pickups[i];
      if (!overlaps(this.player, pickup)) continue;
      this.pickups.splice(i, 1);
      this.shieldTime = 6;
      this._nextPickupAt = this.elapsed + 14;
      this._emit('shield', { action: 'pickup', x: pickup.x, y: pickup.y });
    }

    // 道具收集
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (!overlaps(this.player, item)) continue;
      this.items.splice(i, 1);

      // 应用道具效果
      switch(item.type) {
        case 'candy':
          this.speedBoost = 1.5;
          setTimeout(() => this.speedBoost = 1, 10000);
          break;
        case 'heart':
          if (this.lives < 3) {
            this.lives++;
            this._emit('heal', { x: item.x, y: item.y, lives: this.lives });
          }
          break;
        case 'clover':
          this.scoreMultiplier = 2;
          setTimeout(() => this.scoreMultiplier = 1, 30000);
          break;
        case 'clock':
          if (!this.endless) {
            this.timeLeft = Math.min(this.level.duration, this.timeLeft + 10);
          }
          break;
        case 'chest':
          // 随机道具
          const itemTypes = ['candy', 'heart', 'clover', 'clock'];
          const randomType = itemTypes[Math.floor(this._random() * itemTypes.length)];
          this._addItem(randomType);
          break;
      }
      this._emit('item', { type: item.type, x: item.x, y: item.y });
    }

    if (!dashing && this.player.invincible <= 0) {
      const hazard = this.hazards.find(item => overlaps(this.player, item));
      if (hazard) {
        if (this.shieldTime > 0) {
          this.shieldTime = 0;
          this.player.invincible = 1.8;
          this._emit('shield', { action: 'block', x: this.player.x, y: this.player.y });
        } else {
          this.lives = Math.max(0, this.lives - 1);
          this.player.invincible = 1.8;
          this.combo = 0;
          this._comboTime = 0;
          this._noDamage = false; // 记录受伤
          this._emit('hit', { x: this.player.x, y: this.player.y, lives: this.lives });
          if (this.lives === 0) { this._finish(false, 'lives'); return this; }
        }
      }
    }

    if (this.pickups.length === 0 && this.elapsed >= this._nextPickupAt) {
      this._addPickup();
      this._nextPickupAt = this.elapsed + 14;
    }
    // 生成道具
    if (this.items.length === 0 && this.elapsed >= this._nextItemAt) {
      const itemTypes = ['candy', 'heart', 'clover', 'clock', 'chest'];
      const randomType = itemTypes[Math.floor(this._random() * itemTypes.length)];
      this._addItem(randomType);
      this._nextItemAt = this.elapsed + 25 + this._random() * 10;
    }
    if (this.endless && this.elapsed >= this._nextHazardAt && this.hazards.length < 14) {
      this._addHazard();
      this._nextHazardAt += 16;
    }
    return this;
  }

  /** Optional polling alternative to onEvent; the bounded queue holds 64 events. */
  drainEvents() {
    const events = this.events;
    this.events = [];
    return events;
  }

  _random() {
    const value = Number(this.rng());
    return Number.isFinite(value) ? clamp(value, 0, 0.999999999) : 0.5;
  }

  _emit(type, details = {}) {
    const event = { type, elapsed: this.elapsed, score: this.score, ...details };
    this.events.push(event);
    if (this.events.length > 64) this.events.shift();
    this.onEvent(event);
  }

  _finish(won, reason) {
    this.state = won ? 'won' : 'lost';
    this.player.vx = 0;
    this.player.vy = 0;
    if (won) this.score += Math.ceil(this.timeLeft) * 10 + this.lives * 100;
    const fastClear = won && this.elapsed <= 30;
    this._emit(won ? 'win' : 'lose', {
      reason,
      collected: this.collected,
      lives: this.lives,
      noDamage: this._noDamage,
      fastClear,
      combo: this.bestCombo,
    });
  }

  _findPosition(radius, playerGap = 85, avoidStars = true, routeGap = 0) {
    const route = routeGap > 0 ? [this.player, ...this.stars] : [];
    const valid = (x, y) => {
      const candidate = { x, y, radius };
      return !overlaps(candidate, this.player, playerGap)
        && !this.hazards.some(item => overlaps(candidate, item, 24))
        && !this.pickups.some(item => overlaps(candidate, item, 20))
        && (!avoidStars || !this.stars.some(item => overlaps(candidate, item, 18)))
        && route.every((point, index) => index === 0 || distanceToSegment(candidate, route[index - 1], point) > routeGap);
    };
    for (let i = 0; i < 160; i++) {
      const x = 75 + this._random() * 850;
      const y = 130 + this._random() * 390;
      if (valid(x, y)) return { x, y };
    }
    // A deterministic grid also makes constant/testing RNG functions safe.
    for (let y = 130; y <= 520; y += 39) {
      for (let x = 75; x <= 925; x += 42.5) {
        if (valid(x, y)) return { x, y };
      }
    }
    return null;
  }

  _addHazard() {
    const radius = 23 + this._random() * 4;
    // Leave a clear opening route; drifting jellyfish can enter it later.
    const routeGap = this.elapsed === 0 && !this.endless ? radius + this.player.radius + 50 : 0;
    const position = this._findPosition(radius, 105, true, routeGap);
    if (!position) return false;
    const angle = this._random() * TAU;
    const speed = 22 + this.levelIndex * 5 + this._random() * 12 + (this.endless ? Math.min(25, this.elapsed / 10) : 0);
    this.hazards.push({ id: ++this._id, ...position, radius, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, phase: this._random() * TAU, type: 'jellyfish' });
    return true;
  }

  _addStar() {
    const position = this._findPosition(13, 75);
    if (!position) return false;
    this.stars.push({ id: ++this._id, ...position, radius: 13, phase: this._random() * TAU, routeIndex: this.collected + 7 });
    return true;
  }

  _addPickup() {
    const position = this._findPosition(15, 65);
    if (!position) return false;
    this.pickups.push({ id: ++this._id, ...position, radius: 15, phase: this._random() * TAU, type: 'shield' });
    return true;
  }

  _addItem(type = 'candy') {
    const position = this._findPosition(16, 70);
    if (!position) return false;
    this.items.push({
      id: ++this._id,
      ...position,
      radius: 16,
      phase: this._random() * TAU,
      type
    });
    return true;
  }
}
