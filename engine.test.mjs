import test from 'node:test';
import assert from 'node:assert/strict';
import { SeaGame, LEVELS, W, H, BOUNDS } from './dist/engine.mjs';

function seeded(seed = 7) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function game(level = 0, endless = false) {
  return new SeaGame({ rng: seeded() }).start(level, endless);
}
function tick(g, seconds, input = {}) {
  const steps = Math.ceil(seconds / 0.025);
  for (let i = 0; i < steps; i++) g.update(seconds / steps, input);
}
function isolate(g) { g.hazards = []; g.pickups = []; g._nextPickupAt = Infinity; return g; }
function touch(g, item) { g.player.x = item.x; g.player.y = item.y; g.update(0.01); }

test('three playable, reachable routes and safe initial spawns, even with a constant RNG', () => {
  assert.equal(W, 1000); assert.equal(H, 650);
  assert.deepEqual(LEVELS.map(level => level.name), ['浅浅心动', '珊瑚来信', '星光都给你']);
  for (const rng of [seeded(), () => 0.5, () => 0, () => 1]) {
    for (let i = 0; i < LEVELS.length; i++) {
      const g = new SeaGame({ rng }).start(i);
      assert.equal(g.stars.length, LEVELS[i].target);
      assert.equal(g.hazards.length, LEVELS[i].hazards);
      assert.equal(g.pickups.length, 1);
      assert.equal(g.player.x, 200); assert.equal(g.player.y, 325);
      for (const star of g.stars) {
        assert.ok(star.x >= BOUNDS.left && star.x <= BOUNDS.right);
        assert.ok(star.y >= BOUNDS.top && star.y <= BOUNDS.bottom);
      }
      for (const hazard of g.hazards) {
        assert.ok(Math.hypot(hazard.x - g.player.x, hazard.y - g.player.y) > 140);
        for (const star of g.stars) assert.ok(Math.hypot(hazard.x - star.x, hazard.y - star.y) > hazard.radius + star.radius);
        for (const other of g.hazards) if (other !== hazard) assert.ok(Math.hypot(hazard.x - other.x, hazard.y - other.y) > hazard.radius + other.radius);
      }
    }
  }
});

test('direction input normalizes diagonal speed, pointer arrives without overshoot, bounds clamp', () => {
  const g = isolate(game());
  g.update(0.05, { x: 1, y: 1 });
  assert.ok(Math.abs(Math.hypot(g.player.x - 200, g.player.y - 325) - 11.25) < 1e-8);
  tick(g, 1, { target: { x: 400, y: 325 } });
  assert.equal(g.player.x, 400); assert.equal(g.player.y, 325);
  tick(g, 5, { x: 1, y: -1 });
  assert.equal(g.player.x, BOUNDS.right); assert.equal(g.player.y, BOUNDS.top);
});

test('update clamps long or invalid frames and zero frames do not trigger collisions', () => {
  const g = isolate(game());
  g.update(20, { x: 1 });
  assert.equal(g.elapsed, 0.05);
  assert.equal(g.player.x, 211.25);
  g.update(NaN, { x: 1 }); g.update(-4, { x: 1 }); g.update(Infinity, { x: 1 });
  assert.equal(g.elapsed, 0.05);
});

test('pause freezes all rules and resumes exactly, and pausing a result is harmless', () => {
  const g = game();
  g.dash(); g.update(0.02, { x: 1 }); g.pause();
  const before = JSON.stringify(g);
  g.update(10, { x: 1 });
  assert.equal(g.dash(), false);
  assert.equal(JSON.stringify(g), before);
  g.resume(); g.update(0.02, { x: 1 });
  assert.equal(g.state, 'playing'); assert.equal(g.elapsed, 0.04);
  g.state = 'won'; g.pause(); g.resume(); assert.equal(g.state, 'won');
});

test('collecting a real route by pointer movement wins every normal level once', () => {
  for (let level = 0; level < LEVELS.length; level++) {
    const g = isolate(game(level));
    while (g.stars.length && g.state === 'playing') {
      const target = g.stars[0];
      let frames = 0;
      while (g.stars.includes(target) && g.state === 'playing' && frames++ < 400) g.update(0.025, { target });
      assert.ok(frames < 400);
    }
    assert.equal(g.state, 'won'); assert.equal(g.collected, LEVELS[level].target);
    assert.ok(g.timeLeft > 0); assert.ok(g.score >= g.collected * 100);
    const score = g.score; g.update(0.05); assert.equal(g.score, score);
    assert.equal(g.events.filter(event => event.type === 'win').length, 1);
  }
});

test('all levels can be completed along the route with live hazards and plenty of time', () => {
  for (let level = 0; level < LEVELS.length; level++) {
    const g = game(level);
    while (g.state === 'playing') g.update(1 / 60, { target: g.stars[0] });
    assert.equal(g.state, 'won', `level ${level + 1} should be completable without disabling hazards`);
    assert.equal(g.collected, LEVELS[level].target);
    assert.ok(g.elapsed < LEVELS[level].duration / 2, 'the timer should allow thoughtful detours');
  }
});

test('100 random layouts per level remain fair for beginners and reward timely dashes', () => {
  const wins = { plain: [0, 0, 0], dash: [0, 0, 0] };
  for (const strategy of ['plain', 'dash']) {
    for (let level = 0; level < LEVELS.length; level++) {
      for (let seed = 1; seed <= 100; seed++) {
        const g = new SeaGame({ rng: seeded(seed) }).start(level);
        while (g.state === 'playing') {
          if (strategy === 'dash' && g.hazards.some(hazard => Math.hypot(hazard.x - g.player.x, hazard.y - g.player.y) < 100)) g.dash();
          g.update(1 / 60, { target: g.stars[0] });
        }
        assert.notEqual(g.events.at(-1).reason, 'time');
        if (g.state === 'won') wins[strategy][level]++;
      }
    }
  }
  assert.equal(wins.plain[0], 100, 'the introduction should be forgiving');
  assert.ok(wins.plain[1] >= 95, 'the middle level should allow a simple route');
  assert.ok(wins.plain[2] >= 70, 'the final level should remain approachable without perfect reflexes');
  assert.ok(wins.dash[2] >= 85, 'using the dash should improve final-level survival');
  assert.ok(wins.dash[2] > wins.plain[2]);
});

test('combo rewards quick collections and expires after three seconds', () => {
  const g = isolate(game());
  touch(g, g.stars[0]); touch(g, g.stars[0]);
  assert.equal(g.combo, 2); assert.equal(g.score, 220); assert.equal(g.bestCombo, 2);
  g.player.x = 200; g.player.y = 325; tick(g, 3.1);
  assert.equal(g.combo, 0);
  touch(g, g.stars[0]); assert.equal(g.combo, 1); assert.equal(g.score, 320);
});

test('several overlapping hazards cause one hit, with 1.8 seconds of protection', () => {
  const g = isolate(game());
  g.hazards = [0, 1, 2].map(id => ({ id, x: 200, y: 325, radius: 25, vx: 0, vy: 0, phase: 0 }));
  g.update(0.01); assert.equal(g.lives, 2); assert.equal(g.player.invincible, 1.8);
  tick(g, 1.7); assert.equal(g.lives, 2);
  tick(g, 0.2); assert.equal(g.lives, 1);
  tick(g, 1.9); assert.equal(g.state, 'lost'); assert.equal(g.lives, 0);
  assert.equal(g.events.filter(event => event.type === 'hit').length, 3);
  assert.equal(g.events.at(-1).reason, 'lives');
});

test('shield lasts six seconds and blocks exactly one collision', () => {
  const g = game(); g.hazards = [];
  touch(g, g.pickups[0]);
  assert.equal(g.shieldTime, 6); assert.equal(g.pickups.length, 0);
  g.hazards = [{ x: g.player.x, y: g.player.y, radius: 25, vx: 0, vy: 0, phase: 0 }];
  g.update(0.01); assert.equal(g.lives, 3); assert.equal(g.shieldTime, 0);
  assert.equal(g.events.at(-1).action, 'block');
  const h = game(); h.hazards = []; touch(h, h.pickups[0]);
  h.player.x = 200; h.player.y = 325; tick(h, 6.1); assert.equal(h.shieldTime, 0);
});

test('dash accelerates, protects against collision, and waits for its cooldown', () => {
  const g = isolate(game());
  assert.equal(g.dash(), true); assert.equal(g.dash(), false);
  g.hazards = [{ x: 225, y: 325, radius: 25, vx: 0, vy: 0, phase: 0 }];
  g.update(0.05, { x: 1 });
  assert.equal(g.player.x, 226.5); assert.equal(g.lives, 3);
  assert.ok(g.player.dashTime > 0); assert.ok(g.player.invincible > 0);
  g.hazards = []; tick(g, 3.2); assert.equal(g.dashCooldown, 0); assert.equal(g.dash(), true);
});

test('ordinary time depletion loses, and a restart fully resets the previous run', () => {
  const g = isolate(game());
  tick(g, LEVELS[0].duration + 0.1);
  assert.equal(g.state, 'lost'); assert.equal(g.timeLeft, 0); assert.equal(g.events.at(-1).reason, 'time');
  g.start(1); assert.equal(g.state, 'playing'); assert.equal(g.timeLeft, LEVELS[1].duration);
  assert.equal(g.score, 0); assert.equal(g.lives, 3); assert.equal(g.events.length, 0);
});

test('endless replenishes safe stars, ignores target and timer, and slowly adds hazards', () => {
  const g = game(0, true); g.hazards = []; g.pickups = [];
  for (let i = 0; i < 20; i++) {
    touch(g, g.stars[0]);
    assert.equal(g.stars.length, 8);
    const latest = g.stars.at(-1);
    assert.ok(Math.hypot(latest.x - g.player.x, latest.y - g.player.y) > 75);
  }
  assert.equal(g.collected, 20); assert.equal(g.state, 'playing'); assert.equal(g.timeLeft, Infinity);
  g.player.x = 35; g.player.y = 90; g.player.invincible = 100;
  tick(g, 65);
  assert.equal(g.state, 'playing'); assert.equal(g.timeLeft, Infinity); assert.equal(g.hazards.length, 4);
});

test('event callbacks expose completed changes, and polling drains without affecting state', () => {
  const received = [];
  const g = new SeaGame({ rng: seeded(), onEvent: event => received.push(event) }).start();
  isolate(g); touch(g, g.stars[0]); g.dash();
  assert.deepEqual(received.map(e => e.type), ['collect', 'dash']);
  assert.equal(received[0].collected, 1); assert.equal(received[0].score, 100);
  assert.equal(g.drainEvents().length, 2); assert.equal(g.events.length, 0); assert.equal(g.collected, 1);
});
