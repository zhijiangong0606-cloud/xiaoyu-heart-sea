# 小鱼的心动海域

给小鱼的中文海底小游戏。静态 HTML / CSS / JavaScript，无需安装依赖。

## 本地运行

在此目录执行 `python -m http.server 8765 --directory dist`，浏览器打开 `http://localhost:8765`。请使用 HTTP 服务打开，ES Modules 不能直接双击 index.html 运行。

## 玩法

- 三段航线：浅浅心动（8 颗星光）、珊瑚来信（12 颗）、星光都给你（16 颗）。
- 方向键 / WASD 控制；也可以在海面按住拖动。空格或「冲刺」按钮短暂无敌，冷却 3.2 秒。
- 蓝色泡泡提供最长 6 秒的护盾，抵挡一次碰撞；受伤后保护 1.8 秒。
- 连续 3 秒内收星有连击加分；3 颗爱心和关卡计时提供适度挑战。
- 通关解锁信笺和下一站；自由漫游可不限时挑战最高分。
- P / Esc 暂停；切换页面自动暂停。音效默认关闭，手动打开。
- 进度存在当前浏览器 localStorage，不收集或上传个人数据。

## 留言

每次通关：「小鱼是最牛的，我不解释！」

最终信笺：「小宝宝，天天开心呀！永远是最棒的小鱼。」

修改 `dist/engine.mjs` 的 `LEVELS` 可编辑三封信和关卡参数；首页文案在 `dist/index.html`。

## 验证

`node --test engine.test.mjs`

## GitHub 灵感来源

仅借鉴玩法与交互思路；程序、Canvas 绘图和文案为本项目原创实现，未复制这些仓库的代码或素材。

- https://github.com/cbrown5/seabird-block-game — 海洋生存、收集与躲避（MIT）。
- https://github.com/tahmidrafi/great-catch — 海洋层次和反馈（当前 LICENSE 为 Apache-2.0）。
- https://github.com/danielalanbates/flappy-axolotl — 爱心、护盾和宽容挑战（当前 LICENSE 为 PolyForm Noncommercial 1.0.0，附商业条款）。

发布和分享访问权限由 Sites 托管管理；已按用户要求设为公开链接，任何知道链接的人都能玩。
